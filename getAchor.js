const fs = require("fs")
const cheerio = require("cheerio")
const path = require("path")

let dirName = "";
let subDirName = "";

const anchorList = []
let message = ""
const url = "https://www.indiabix.com/c-programming/control-instructions/012001";

async function getanchor(url) {
    return new Promise(async resolve => {
        const res = await fetchUrl(url)
        fetchData(res).then(message => {
            resolve(message)
        })
    })

    // console.log("data ", message)
    // return `${message}`
}

const fetchUrl = async (url) => {
    try {
        const res = await fetch(url);
        if(res){
            return await res.text();
        }
    } catch (err) {
        console.log("feetch", err)
    }
}

async function fetchData(body) {
    try {
        const $ = cheerio.load(body);
        // Recursive call
        let nextPage = $("a")
        // console.log(nextPage)
        nextPage.each(async (index, value) => {
            // Print the text from the tags and the associated href
            let nextUrl = $(value).attr("href")
            if ($(value).attr("href") != "#" ) {
                anchorList.push(nextUrl);
                // await getanchor(nextUrl);

            }
            // console.log(nextUrl);
        })
        save(anchorList);
        return new Promise(resolve => {
            readURL("./IndiaBix/allurl.json");
            resolve(message);
        })
    } catch (err) {
        console.log(err)
    }
}

const save = async (list) => {
    let subfolder = `./IndiaBix`;
    await fs.promises.mkdir(`./${subfolder}`, { recursive: true });
    const filePath = path.join(subfolder, `allurl.json`);
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) console.log(err)
        if (data) {
            data = JSON.parse(data);
            console.log(typeof data);
            // data.foreach(d => {
            //     console.log(d)
            // })
            let d = [...data, ...list]
            let setData = new Set(d);
            finalData = JSON.stringify([...setData]);
            fs.writeFile(filePath, finalData, (err) => {
                if (err) console.log(err)
            })
        } else {
            finalData = JSON.stringify(list);
            fs.writeFile(filePath, finalData, (err) => {
                if (err) console.log(err);
            })

        }
    })
}

const readURL = async (filePath) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) console.log(err);
        if (data) {
            data = JSON.parse(data);

            const urlList = [...data];
            // console.log(typeof urlList);
            // console.log(data[10])
            for (let i = 0; i < urlList.length; i++) {
                // if(i >= 10){
                // console.log(i)

                // console.log(urlList[i]);
                // getanchor(urlList[i]);
                // break;
                // }

            }
        }
    })
}

getanchor(url);
module.exports = getanchor