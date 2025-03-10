import "./suggest.css";


const Suggest=()=>{
  return(
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
         {Array.from({ length: 4 }, (_, i) => (
            <div className="frnd-sug">
              <div className="sug-profile">
                <img
                  className="frnd-sug-img"
                  alt=""
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrmc88PffAo0Dkm8ESzfQZDOlvOpD2NtzKow&s"
                ></img>
                <p>bimal</p>
              </div>
              <button className="follow">Follow</button>
            </div>
          ))}
         </div>
        </div>

        <div className="SaveContainer">
          Your collection
          <div className="saveHeader">
           {Array.from({length:10},(_,i)=>(
            <div className="your-save">
              
            </div>

           ))}
          </div>

        </div>

      </div>
  )
}

export default Suggest;