import toast from "react-hot-toast"

function Test() {
  return (
    <div>
        <button onClick={()=> toast("Toast working fine")}>click me </button>
    </div>
  )
}

export default Test
