const path = require("path")
const program = require("commander")
const { version } = require("../package.json")
const process = require("process")

const mapActions = {
    create: {
        alias: "c",
        description: "create a project",
        examples: [
            "hh-cli create <projectName>"
        ]
    },
    config: {
        alias: "conf",
        description: "config project variable",
        examples: [
            "hh-cli config set <k> <v>",
            "hh-cli config get <k>"
        ]
    },
    "*": {
        description: "Not Found Commander",
        examples: []
    }
}

Reflect.ownKeys(mapActions).forEach(action => {

    program.command(action)
        .action(() => {
            if (action === "*") {
                console.log(mapActions[action].description)
            } else {
                //hh-cli create xxx  , 截取xxx (项目名称)
                require(path.resolve(__dirname,action))(...process.argv.slice(3))
            }
        })
        .description(mapActions[action].description)
        .alias( mapActions[action].alias)
})
program.on("--help", () => {
    console.log(`\nExamples:`)
    Reflect.ownKeys(mapActions).forEach(action => {
        mapActions[action].examples.forEach(example=>{
            console.log(`  ${example}`)
        })
    })
})



program.version(version).parse(process.argv)