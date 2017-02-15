'use strict';

const {dialog} = require('electron').remote;

const fs = require('fs');
const path = require('path');

const Handlebars = require('handlebars');
const View = require('exo').View;
const create_game_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/create_game.html'), 'utf8');

class CreateGameView extends View {
    get events() {
        return {
            'click #save_button': this.save.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.template = Handlebars.compile(create_game_tmpl);
    }
    save(event) {
        event.preventDefault();
        event.stopPropagation();

        const data = {
            name: this.element.querySelector('#game_name').value,
            description: this.element.querySelector('#game_description').value,
            version: this.element.querySelector('#game_version').value
        };
        const result = dialog.showOpenDialog({properties: ['openDirectory']});
        if (result !== undefined) {
            fs.writeFileSync(path.normalize(result + '/game.json'), JSON.stringify(data));
            fs.mkdirSync(path.normalize(result + '/sprite_sheets'));
        }
        this.emit('created');
        console.log("Do Create Game");

        return false;
    }
    render() {
        this.element.innerHTML = this.template({});
    }
}

module.exports = {
    CreateGameView: CreateGameView
};
