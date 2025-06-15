import React from 'react';
import { useNavigate } from 'react-router-dom';

function Postcard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${post._id}`);
  };

  return (
    <div className='postcard' onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="post-author">
        <strong>{post.createdBy?.firstName} {post.createdBy?.lastName}</strong>
      </div>
      <div className="postwords">
        <p>{post.caption}</p>
      </div>
      <div className="postrecomendations">
        <h4>🩷 <span>{post.likes?.length || 0}</span></h4>
        <h4>💬 <span>{post.comments?.length || 0}</span></h4>
        {/* <h4>🔗 <span>0</span></h4> */}
      </div>
    </div>
  );
}

export default Postcard;
