'use strict';

const fs = require('fs');
const path = require('path');

const Handlebars = require('handlebars');
const View = require('exo').View;
const character_editor_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/character_editor.html'), 'utf8');

class CharacterEditor extends View {
    get events() {
        return {
            // 'click #save_sprite_sheet_button': this.save.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game = options.game;
        this.template = Handlebars.compile(character_editor_tmpl);
    }
    save() {
        //
    }
    render() {
        const render_data = this.model.serialize();
        this.element.innerHTML = this.template(render_data);
    }
}

module.exports = CharacterEditor;
