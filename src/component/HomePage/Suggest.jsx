import { useEffect, useRef, useState } from "preact/hooks";
import "./suggest.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../hooks/fetchAllUser";
import { useNavigate } from "react-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../Utils/firebase";

const Suggest = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((store) => store.allUser);
  const currentUser = useSelector((store) => store.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [collection, setCollection] = useState([]);
  const [data, setData] = useState([]);
  const [view, setView] = useState(false);
  const [viewIndex, setViewIndex] = useState(null);
  const postRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers());
    const unsub = fetchCollection();
    return () => unsub && unsub(); // Clean up snapshot
  }, []);

  useEffect(() => {
    if (view && viewIndex !== null && postRefs.current[viewIndex]) {
      postRefs.current[viewIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [view, viewIndex]);

  const filteredUser = users.filter(
    (user) =>
      user.uid !== currentUser?.uid &&
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCollection = () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      const data = snapshot.data();
      const collectionIds = data?.myCollection || [];
      setCollection(collectionIds);

      const collectionList = await Promise.all(
        collectionIds.map(async (postId) => {
          const postRef = doc(db, "posts", postId);
          const postDoc = await getDoc(postRef);
          if (postDoc.exists()) {
            return { id: postDoc.id, ...postDoc.data() };
          }
          return null;
        })
      );

      setData(collectionList.filter((item) => item !== null));
    });

    return unsubscribe;
  };

  const handleFriends = (f) => {
    navigate("/friendprofile", { state: { friendsId: f } });
  };

  const handleView = (index) => {
    setViewIndex(index);
    setView(true);
  };

  const handleLike = (id) => {
    console.log("Like clicked for post:", id);
  };

  const toggleCommentBox = (id) => {
    console.log("Comment toggle for post:", id);
  };

  const handleCollection = (id) => {
    console.log("Collection toggle for post:", id);
  };

  return (
    <div className="suggetion">
      <div className="logo">
        <div className="bird"></div>
      </div>

      <div className="sug-header">
        <h3>People to follow</h3>
        <h4>See all</h4>
      </div>

      <div className="sug-container">
        <div className="sug-holder">
          <div className="frndSearch">
            <input
              type="text"
              placeholder="search people"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img
              className="searchImg"
              src="..\src\assets\image\search.png"
              alt="search"
            />
          </div>

          {filteredUser.map((user) => (
            <div
              className="frnd-sug"
              key={user.uid}
              onClick={() => handleFriends(user.uid)}
            >
              <div className="sug-profile">
                <img className="frnd-sug-img" alt="" src={user.photoURL} />
                <p>{user?.displayName}</p>
              </div>
              <button className="follow">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="SaveContainer">
        <h4>Your Collection</h4>
        <div className="saveHeader">
          {data.length > 0 ? (
            data.map((p, i) => (
              <div className="your-save" key={p.id}>
                {p.mediaUrl.endsWith(".mp4") ? (
                  <video src={p.mediaUrl} controls></video>
                ) : (
                  <img
                    src={p.mediaUrl}
                    alt="saved item"
                    className="saved-img"
                    onClick={() => handleView(i)}
                  />
                )}
              </div>
            ))
          ) : (
            <p style={{ marginTop: "10px" }}>No items saved yet.</p>
          )}
        </div>
      </div>

      {view && (
        <div className="colloctionView">
          <button className="close-btn" onClick={() => setView(false)}>
            X
          </button>
          {data.map((p, i) => (
            <div
              key={p.id}
              className="post-box"
              ref={(el) => (postRefs.current[i] = el)}
            >
              <div className="user-dl">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXWJJvzu6UVle-G5x_9pw-IPKwx71sVcn53A&s"
                  className="user-profile"
                  alt="User profile"
                />
                <div className="user-name">{p?.userName}</div>
              </div>

              <div className="pp">
                <div className="post">
                  {p.mediaUrl.endsWith(".mp4") ? (
                    <video
                      src={p.mediaUrl}
                      controls
                      onClick={(e) =>
                        e.target.paused ? e.target.play() : e.target.pause()
                      }
                    />
                  ) : (
                    <img src={p.mediaUrl} alt="Post media" />
                  )}
                </div>

                <div className="reactElement">
                  <div>
                    <span className="love" onClick={() => handleLike(p.id)}>
                      {p.likes?.some(
                        (like) => like.userId === auth.currentUser?.uid
                      )
                        ? "❤️"
                        : "🤍"}
                    </span>

                    <img
                      className="comment"
                      src="./src/assets/image/comments.png"
                      alt="Comment"
                      onClick={() => toggleCommentBox(p.id)}
                    />

                    <img
                      className="save"
                      src="./src/assets/image/bookmark.png"
                      alt="Save"
                      onClick={() => handleCollection(p.id)}
                    />
                  </div>
                  <div className="shareDIv">
                    <img
                      className="share"
                      src="./src/assets/image/share2.png"
                      alt="Share"
                    />
                  </div>
                </div>

                <div className="bottom">
                  <p>{p.likes?.length || 0} Likes</p>
                  <div className="userDesc">
                    <p className="userName">{p.userName}</p>
                    <p>{p.description}</p>
                  </div>
                  <div className="latestComment">
                    <p>{p.latestCommenter}</p>
                    <p>{p.latestComment}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggest;
