import "./post.css";

const Post = () => {
  return (
    <div className="contain-cart ">
      <div className="containt  ">
        {Array.from({ length: 100 }, (_, i) => (
          <div className="post-box ">
            <div className="user-dl ">
              <div className="user-profile"></div>
              <div className="user-name">shanta_143</div>
            </div>
            <div className="pp">
              <div className="post">
                <img
                  src="https://m.media-amazon.com/images/I/81KQyAE5LiL.jpg"
                  alt="post"
                />
              </div>
              <div className="reactElement ">
                <div>
                  <img className="love" src="./src/assets/image/heart1.png" />
                  <img
                    className="comment"
                    src="./src/assets/image/comment1.png"
                  />
                  <img className="save" src="./src/assets/image/bookmark.png" />
                </div>
                <div className="shareDIv">
                  <img
                    className="share"
                    src="./src/assets/image/send.png"
                  ></img>
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Post;
