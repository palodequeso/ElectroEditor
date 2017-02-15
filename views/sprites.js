'use strict';

// const {dialog} = require('electron').remote;

// const fs = require('fs');
const path = require('path');
// const sizeOf = require('image-size');
// const fse = require('fs-extra');

const Handlebars = require('handlebars');
const View = require('exo').View;

const SpriteEditor = require('./sprite.js');

const Electro = require('electroengine');
const Sprites = Electro.models.graphics.Sprites;
// let Sprites = require('../../engine/models/graphics/sprites.js');

// let edit_sprites_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/edit_sprites.html'), 'utf8');

class SpritesEditor extends View {
    get events() {
        return {
            'click .sprite_selector': this.select_sprite.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game = options.game;
        this.sprites = new Sprites(options.sprites);
        this.sprite_sheet = options.sprite_sheet;
        this.original_path = path.join(this.game.path, 'images', 'sprite_sheets', this.sprite_sheet.path);
        this.template = Handlebars.compile(edit_sprites_tmpl);

        this.current_sprite = null;
    }
    select_sprite_sheet() {
        // TODO: Select from drop down.
    }
    select_sprite(event) {
        const sprite_id = event.target.dataset.id;
        console.log("Select Sprite: ", sprite_id, this.sprites);
        this.current_sprite = this.sprites.get(sprite_id);
        console.log("Current Sprite: ", this.current_sprite);
        this.render();
    }
    save(event) {
        event.preventDefault();
        event.stopPropagation();

        // TODO
    }
    render() {
        if (this.current_sprite === null) {
            const render_data = {
                sprite_sheet: this.sprite_sheet,
                sprites: this.sprites.serialize()
            };
            render_data.original_path = this.original_path;
            render_data.game_path = this.game.path;
            console.log("Render Data: ", render_data);
            this.element.innerHTML = this.template(render_data);
        } else {
            this.element.innerHTML = '';
            // this.element.innerHTML = `<div>
            //     ${this.current_sprite.id}
            // </div>`;
            const view = new SpriteEditor({
                model: this.current_sprite,
                game: this.game
            });
            view.render();
            this.element.appendChild(view.element);
        }
    }
}

module.exports = SpritesEditor;
