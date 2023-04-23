const fs = require("fs")
const cheerio = require("cheerio")
const path = require("path")

let dirName = "";
const url = "https://www.indiabix.com/computer-science/computer-hardware/";

let message = ""

async function scrabe(url) {
    return new Promise( async resolve => {
        const res = await fetchUrl(url)
        fetchData(res).then(message => {
            resolve(message)
        })
    })
    // console.log("data ", message)
    // return `${message}`
}

const fetchUrl = async (url) => {
    const res = await fetch(url);
    return await res.text();
}

function fetchData(body) {
    return new Promise(resolve => {
        const quizBody = {};
        const $ = cheerio.load(body);
        const title = $(".title-wrapper")
            .find(".title div h1");
        quizBody.chapter_name = title.text().split("-").at(-1).trim();
        dirName = title.text().split("-")[0].trim();
        // console.log(dirName)
        const questions = [];
        const bixDivContainer = $('.card-style .bix-div-container')
        for (let i = 0; i < bixDivContainer.length; i++) {
            const d = {}
            let questionTitle = $(bixDivContainer[i])
                .find(".bix-td-qtxt")
                .text()
                .trim();
            d.question_title = questionTitle;
            const options = []
            const o = {}
            const optionDiv = $(bixDivContainer[i])
                .find(".bix-td-option-val");
            for (let i = 0; i < optionDiv.length; i++) {
                const option = $(optionDiv[i])
                    .text().trim()
                o[`opt_${i}`] = option
            }
            let description = $(bixDivContainer[i])
                .find(".bix-td-miscell .bix-div-answer .bix-ans-description")
                .text()
                .trim();
            // console.log(description)

            let answer = $('[class=jq-hdnakq][type=hidden]')[0].attribs.value;
            // let answer = $(bixDivContainer[i])

            o["correct_answer"] = o[`opt_${answer.charCodeAt(0) - 65}`]
      
            o["description"] = description.replace("Let's discuss.","").trim()
            options.push(o);
            d.options = options;
            questions.push(d);
            // console.log(o["description"])
            // break;
        }
        quizBody.questions = questions

        saveJson(dirName, quizBody)

        // Recursive call
        let nextPage = $(".pagination li:last a")
        nextPage.each(async (index, value) => {
            // Print the text from the tags and the associated href
            let nextUrl = $(value).attr("href")
            if ($(value).attr("href") != "#") {
                await scrabe(nextUrl)

            }
        })
        resolve(message)
    })

}
// console.log(body)
const saveJson = (dir, databody) => {
    try{
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const filePath = path.join(dir, `${databody.chapter_name}.json`);
        let finalData = {};
        let hasNewData = false;
        let newData = 0;
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) console.log(err)
            if (data) {
                data = JSON.parse(data);
                finalData.chapter_name = data.chapter_name;
                for (let savedQuestion of data.questions) {
                    // console.log(question.question_title)
                    for (let newquestion of databody.questions) {
                        // console.log(newquestion.question_title)
                        if (savedQuestion.question_title == newquestion.question_title) {
                            // Compare options  
                            const isAllCommonOption = false;
                            const optionsInSavedQuestion = Object.keys(savedQuestion.options[0]).length;
                            const optionsInNewQuestion = Object.keys(newquestion.options[0]).length;
                            // console.log(optionsInSavedQuestion)
                            // console.log(optionsInNewQuestion)
    
                            if (optionsInNewQuestion == optionsInSavedQuestion) {
    
                                let flag = 0;
                                for (let newOption in newquestion.options[0]) {
                                    for (let savedOption in savedQuestion.options[0]) {
                                        if (newquestion.options[0][newOption] == savedQuestion.options[0][savedOption]) {
                                            // console.log("found ===> ", newquestion.options[0][newOption])
                                            flag++;
                                        }
                                    }
                                }
                                if (optionsInNewQuestion == flag - 2) {
                                    // console.log(`${flag - 2} outof ${optionsInNewQuestion} options are found same in question ==> ${newquestion.question_title}`);
                                    // console.log("all options are same")
                                    const index = databody.questions.indexOf(newquestion)
                                    databody.questions.splice(index, 1);
                                }
                                // else {
                                // console.log(`${flag} outof ${optionsInNewQuestion} options are found same in question ==> ${newquestion.question_title}`);
    
                                // do you want to keep this question
    
                                // const index = databody.questions.indexOf(newquestion)
                                // databody.questions.splice(index, 1);
                                // }
    
                                // console.log(flag);
                                // console.log();
                                // for(let savedOption in )
                                // let maxLength = Math.min(newquestion.options[0].length, savedQuestion.options[0].length)
                                // console.table(savedQuestion.options[0])
                                // console.table(newquestion.options[0])
                                // console.log(maxLength)
                                // const optionSet = new Set([...newquestion.options, ...savedQuestion.options])
                                // if (optionSet.size == maxLength) {
                                //     const index = databody.questions.indexOf(newquestion)
                                //     databody.questions.splice(index, 1);
                                // }
                            }
                        }
                    }
                }
                newData = databody.questions.length;
                if (newData) {
                    hasNewData = true;
                    finalData.questions = [...(data.questions), ...(databody.questions)]
                }
            }
            else {
                hasNewData = true;
                newData = databody.questions.length
                finalData = databody
            }
            if (newData) {
                shuffleArray(finalData.questions);
                finalData = JSON.stringify(finalData);
                fs.writeFile(filePath, finalData, (err) => {
                    if (err) console.log(err)
                    message = `${newData} new data found`;
                    // console.log(`${newData} new data found`);
                })
            } else {
                // console.log()
                message = "No new data found.";
                // console.log("No new data found.");
            }
        })

    }catch(err){
        console.log(err)
    }
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// scrabe(url);
module.exports = scrabe