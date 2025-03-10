import "./story.css";
const Story=()=> {
  return (
    <div className="story-container">
      <div className='story-list'>
      {Array.from({length:100},(_,i)=>(

        <div>
            <div className='story-li'></div>
            <label>Shree Satya</label>

        </div>
      
    ))}
    </div>
    </div>
  )
}

export default Story;
