const fs = require('fs-extra')
const path = require('upath')
const YAML = require('yamljs');
const moment = require('moment')
const md = require('markdown-it')();
const implicitFigures = require('markdown-it-implicit-figures');

const globalOptions = YAML.load('./config.yml')



const contentFolder = path.resolve(globalOptions.contentDir)


const createFullPath = folderPath => fileName => path.resolve(folderPath, fileName)

const isFile = filepath => fs.statSync(filepath).isFile()

const readFile = function (filePath) {
    return {'srcurl': filePath, 'filecontents': YAML.load(filePath)}
}

const readPath = function(fileObj) {
    fileObj.srcurl = path.parse(fileObj.srcurl)
    return fileObj
}
const pathInfo = function(fileObj) {
    fileObj.slug = fileObj.srcurl.name
    fileObj.folder = fileObj.srcurl.dir.replace(contentFolder, '').substr(1)
    fileObj.fileurl = fileObj.folder + '/' + fileObj.slug
    return fileObj
}

const modifyFileObj = function(fileObj) {
    let frontmatter = fileObj.filecontents
    let newObj = Object.assign(fileObj, frontmatter)
    delete newObj.filecontents
    delete newObj.srcurl
    return newObj
}

const getCollection = function(folderPath) {
    return fs.readdirSync(folderPath)
    .map(createFullPath(folderPath))
    .filter(isFile)
    .map(readFile)
    .map(readPath)
    .map(pathInfo)
    .map(modifyFileObj)
}
const getItem = function(filePath) {
    return modifyFileObj(pathInfo(readPath(readFile(path.resolve(filePath)))))
}

const urlResolve = function(item, lang) {
    if (item.type == 'page') return lang.path + item.slug + "/index.html"
    if (item.type == 'post') return lang.path + "blog/" + item.slug + ".html"
    if (item.type == 'news') return lang.path + "news/" + item.slug + ".html"
    if (item.type == 'project') return lang.path + "projects/" + item.slug + ".html"
    if (item.type == 'member') return lang.path + "members/" + item.slug + ".html"
    if (item.type == 'activity') return lang.path + "what-we-do/" + item.slug + ".html"
    if (item.type == 'home') return lang.path + "index.html"
}

const renderTemplate = function(compiledTemplate, controllerOptions, dir) {
    globalOptions.languages.forEach(function(lng) {
        let options = Object.assign(globalOptions, controllerOptions)
        options.language = lng
        options.url = urlResolve(controllerOptions, lng)
        options.pageurl = function(page) {
            return urlResolve(page, lng)
        }
        options.formatDate = function(date) { 
            moment.locale(lng.locale) 
            return moment(date).format(globalOptions.dateFormat) 
        }
        options.get = function(fieldname) { if (lng.path = '/') {return fieldname} else {return fieldname + '_' + lng.locale} }
        options.md = md;
        options.implicitFigures = implicitFigures
        fs.ensureDirSync(globalOptions.publicDir + lng.path + dir )
        fs.writeFile(globalOptions.publicDir + urlResolve(controllerOptions, lng), compiledTemplate(options))
    })
}

exports.getCollection = getCollection
exports.getItem = getItem
exports.render = renderTemplate
