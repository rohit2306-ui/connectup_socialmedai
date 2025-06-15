const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb://127.0.0.1:27017/insta-thread';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'));

const JWT_SECRET = 'secretkey123';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requests: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
});



const postSchema = new mongoose.Schema({
  caption: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ body: String, by: mongoose.Schema.Types.ObjectId }]
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

app.delete('/api/post/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.createdBy.toString() !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to delete this post' });
  }

  await post.deleteOne();
  res.json({ message: 'Post deleted successfully' });
});
app.get('/api/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('comments.by', 'firstName lastName');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, email, password: hashed });
  await user.save();
  res.json({ message: 'User created' });
});
app.post('/api/accept/:id', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const requesterId = req.params.id;

    // Check if request exists
    const exists = currentUser.requests.find(r => r.from.toString() === requesterId);
    if (!exists) return res.status(400).json({ error: 'No such request' });

    // Add to connections
    if (!currentUser.connections.includes(requesterId)) {
      currentUser.connections.push(requesterId);
    }

    const requester = await User.findById(requesterId);
    if (!requester.connections.includes(req.userId)) {
      requester.connections.push(req.userId);
    }

    // Remove the request
    currentUser.requests = currentUser.requests.filter(
      r => r.from.toString() !== requesterId
    );

    await currentUser.save();
    await requester.save();

    res.json({ message: 'Request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error accepting request' });
  }
});
app.get('/api/feed', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const posts = await Post.find({ createdBy: { $in: currentUser.connections } })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 }); // optional: latest first

    // Random shuffle (optional)
    const shuffled = posts.sort(() => 0.5 - Math.random());
    res.json({ posts: shuffled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Feed fetch error' });
  }
});
app.post('/api/posts', auth, async (req, res) => {
  const { caption } = req.body;

  const post = new Post({
    caption,
    createdBy: req.userId,
    likes: [],
    comments: []
  });

  await post.save();

  // Notify all connections
  const currentUser = await User.findById(req.userId);
  const connections = currentUser.connections;

  await Promise.all(connections.map(async (connId) => {
    const user = await User.findById(connId);
    user.notifications = user.notifications || [];
    user.notifications.push({
      type: 'new_post',
      from: req.userId,
      postId: post._id,
      message: `${currentUser.firstName} posted something new`
    });
    await user.save();
  }));

  res.json({ message: 'Post created' });
});



app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName connections')
      .populate('connections', 'firstName lastName');
      
    const posts = await Post.find({ createdBy: req.params.id });

    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user dashboard' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Wrong password' });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  res.json({
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
});

app.post('/api/connect/:id', auth, async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  // prevent duplicate
  const alreadySent = targetUser.requests.some(r => r.from.toString() === req.userId);
  if (alreadySent) return res.status(400).json({ error: 'Already sent request' });

  targetUser.requests.push({ from: req.userId });
  await targetUser.save();
  res.json({ message: 'ConnectUP request sent' });
});
app.get('/api/notifications', auth, async (req, res) => {
  const user = await User.findById(req.userId).populate('requests.from', 'firstName lastName');
  res.json({ notifications: user.requests });
});
app.get('/api/feed', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const posts = await Post.find({ createdBy: { $in: user.connections } })
    .populate('createdBy', 'firstName lastName');
  res.json({ posts });
});


app.get('/api/users', auth, async (req, res) => {
  const query = req.query.search?.toLowerCase();
  const users = await User.find({
    $or: [
      { firstName: new RegExp(query, 'i') },
      { lastName: new RegExp(query, 'i') }
    ]
  }).select('firstName lastName _id');
  res.json(users);
});
app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName');
    const posts = await Post.find({ createdBy: req.params.id });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.get('/api/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});
app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName');
    const posts = await Post.find({ createdBy: req.params.id });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user dashboard' });
  }
});


app.post('/api/posts', auth, async (req, res) => {
  const { caption } = req.body;
  const post = new Post({ caption, createdBy: req.userId, likes: [], comments: [] });
  await post.save();
  res.json({ message: 'Post created' });
});
app.get('/api/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('comments.by', 'firstName lastName'); // ✅ Add this
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'firstName lastName') 
      .populate('comments.by', 'firstName lastName'); 

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/myposts', auth, async (req, res) => {
  const posts = await Post.find({ createdBy: req.userId });
  res.json(posts);
});
app.post('/api/post/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);
    } else {
     
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
    }

    await post.save();
    res.json({ message: 'Post liked/unliked' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while liking post' });
  }
});
app.post('/api/post/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ body: content, by: req.userId });
    await post.save();

    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while commenting' });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
