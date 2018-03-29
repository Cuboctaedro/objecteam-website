const copydir = require('copy-dir')
const fs = require('fs-extra')
const pug = require('pug')
const YAML = require('yamljs');
const generator = require('./generator/generator.js')
const _ = require('lodash')

const globalOptions = YAML.load('./config.yml')

const public = globalOptions.publicDir
const static = globalOptions.staticDir
const content = globalOptions.contentDir

const templates = {
    'home': pug.compileFile('templates/home.pug'),
    // 'project': pug.compileFile('templates/project.pug'),
    // 'projects': pug.compileFile('templates/projects.pug'),
    // 'member': pug.compileFile('templates/member.pug'),
    // 'members': pug.compileFile('templates/members.pug'),
    'page': pug.compileFile('templates/page.pug'),
    // 'links': pug.compileFile('templates/links.pug'),
    // 'audiolist': pug.compileFile('templates/audiolist.pug'),
}

const pages = {
    'home': generator.getItem(content + '/index.yml'),
    // 'contact': generator.getItem(content + '/contact.yml'),
    // 'about': generator.getItem(content + '/what-we-do.yml'),
    // 'projects': generator.getItem(content + '/projects.yml'),
    // 'members': generator.getItem(content + '/who-we-are.yml'),
    // 'news': generator.getItem(content + '/news.yml'),
    // 'blog': generator.getItem(content + '/blog.yml'),
}

const collections = {
    // 'projects': _.orderBy(generator.getCollection(content + '/projects'), 'date', 'desc'),
    // 'members': _.orderBy(generator.getCollection(content + '/members'), 'title', 'asc'),
    // 'activities': generator.getCollection(content + '/activities'),
}

const writePage = function(page, template, dir = pages[page]['slug']) {
    let options = new Object()
    options.page = pages[page]
    options.pages = pages
    options.collections = collections
    generator.render(template, options, dir)
}

const writeCollection = function(collection, template) {
    collections[collection].forEach(function(item) {
        let options = new Object()
        options.page = item
        options.pages = pages
        options.collections = collections
        generator.render(template, options, item['folder'])
    })
}


fs.ensureDirSync(public)

copydir(static, public, function(err){
    if(err){
        console.log(err)
    } else {
        console.log('static files copied!')
    }
})
writePage('home', templates.home, '')
