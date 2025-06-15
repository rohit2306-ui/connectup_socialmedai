// ✅ App.jsx - Update dashboard route to use dynamic userId
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashbord';
import Navbar from './Components/Navbar';
import Post from './Components/Post';
import PostcardComment from './Components/PostcardComment';
import UserDashboard from './Components/UserDashboard';
import Home from './Components/Home';
import Notification from './Components/Notification';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/post" element={<Post />} />
        <Route path="/post/:id" element={<PostcardComment />} />
        <Route path="/user/:id" element={<UserDashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
    </Router>
  );
}

export default App;
