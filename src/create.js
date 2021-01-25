const axios = require("axios");
const ora = require("ora")
const inquirer = require("inquirer")
let downloadGitRepo = require("download-git-repo")
const { promisify } = require("util")
let { downloadDirectory } = require("./constants");
const path = require("path");
const MetalSmith = require("metalsmith"); //遍历文件夹
const { render } = require("consolidate").ejs;
const fs = require("fs");
let ncp = require("ncp");
ncp = promisify(ncp)
downloadGitRepo = promisify(downloadGitRepo); //将函数转成promise形式的
// Git地址 ： https://api.github.com/orgs/zhu-cli/repos
const fetchRepoList = async () => {
    let url = "https://api.github.com/orgs/zhu-cli/repos";
    // let url = "https://api.github.com/repos/1151508346/vmdiff";
    const { data } = await axios.get(url);
    return data;
}
const fetchTagList = async (repo) => {
    let url = `https://api.github.com/repos/${repo}/tags`;
    const { data } = await axios.get(url);
    return data;
}
const waitFnLoading = (fn, message) => async (...args) => {

    let spinner = ora(message)
    spinner.start();
    let result = await fn(...args);
    spinner.succeed(); //template download success
    return result;
}
const download = async (repo, tag) => {
    let api = `/zhu-cli/${repo}`
    if (tag) {
        api += `#${tag}`;
    }

    let dest = path.join(downloadDirectory, repo)
    downloadGitRepo(api, dest)



}
module.exports = async function (projectName) {
    let repos = await waitFnLoading(fetchRepoList, "fetch template .... ")();
    console.log(repos)
    repos = repos.map(item => item.name)
    const { repo } = await inquirer.prompt({
        name: "repo",
        type: "list",
        message: "please choise a template to create a project",
        choices: repos
    })
    console.log(repo)

    //列出所有的版本号
    // 指定template所对应的所有版本号 :  https://api.github.com/repos/模板名称/repos
    // 例子:https://api.github.com/repos/vue-simple-template/tags

    let tags = await waitFnLoading(fetchTagList, "fetch tags .... ")(repo);

    const { tag } = await inquirer.prompt({
        name: "tags",
        type: "list",
        message: "please choise a template to create a project",
        choices: tags
    })
    console.log(tag)
    let result = await waitFnLoading(download, "download template .... ")(repo, tag);
    console.log(result) //下载目录


    //拿到下载模板之后，直接拷贝到当前执行的目录下即可   npm i ncp
    //path.resolve() 当前执行操作的目录 
    //复杂的模板需要模板渲染，渲染之后在拷贝

    if (!fs.existsSync(patn.join(result, 'ask.js'))) {
        await ncp(result, path.resolve(projectName))
    } else {
        //复杂模板编译后在再进行拷贝
        await new Promise((resolve, reject) => {
            MetalSmith(__dirname)
                .source(result)
                .destination(path.resolve(projectName))
                .use((files, metal, done) => {
                    const args = require(path.join(result, 'ask.js'))
                    let obj = inquirer.prompt(args) //拿到的就是渲染之后的结果
                    let meta = metal.metaData();
                    Object.assign(meta, obj); //将obj合并在meta上去
                    delete files['ask.js']
                    done()

                })
                .use((files, metal, done) => {
                    let obj = metal.metaData()
                    Reflect.ownKeys(files).forEach(async file => {
                        if (file.includes("js") || file.includes("json")) {
                            let content = files[file].content.toString();
                            // if (content.includes("<%")) { //说明是模板引擎
                            if(/\<%(.*)%\>/.test(content)){
                                content = await render(content,obj)
                                files[file].content = Buffer.from(content);
                            }

                        }

                    })
                    done();
                })
                .build(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })

        })
    }





}