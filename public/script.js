console.log("object")
const fetchDataByUrl = document.querySelector("#fetchDataByUrl");
fetchDataByUrl.addEventListener("submit", async (e) => {
    e.preventDefault()

    const res = await fetch("http://localhost:3000/api", {
        method: 'POST',
        body: JSON.stringify({
            url: e.target.url.value
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
    const data = await res.json();
    document.querySelector("#id").innerHTML = `<div class="alert alert-success" role="alert">
    ${data.message}
  </div>
  `;
    console.log(data)
})
