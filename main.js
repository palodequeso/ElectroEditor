'use strict';

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const App = require('./views/app.js');

Handlebars.registerHelper('times', function(n, block) {
    console.log("Times: ", n);
    let i = 0;
    let accum = '';
    for (i = 0; i < n; i += 1) {
        accum += block.fn(i);
    }
    return accum;
});

document.addEventListener("DOMContentLoaded", () => {
    let preload_game_path = null;
    try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), 'utf-8'));
        if (config.hasOwnProperty('preload_game_path')) {
            preload_game_path = config.preload_game_path;
        }
    } catch (e) {
        console.warn("No config file found in root dir!", e);
    }

    const titlebar = new hx.TitleBar('.heading');
    const sidebar = new hx.Sidebar('.hx-sidebar'/*, {
        headerSelector: '.titlebar',
        contentSelector: '.content',
        autoAddSidebarClass: false
    }*/);

    const app = new App({
        element: document.querySelector('body'),
        preload_game_path: preload_game_path
    });
    app.render();
});
