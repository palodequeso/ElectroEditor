'use strict';

// const {dialog} = require('electron').remote;

const fs = require('fs');
const path = require('path');
// let sizeOf = require('image-size');
// let fse = require('fs-extra');

const Handlebars = require('handlebars');
const View = require('exo').View;
const edit_sprite_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/edit_sprite.html'), 'utf8');

class SpriteAnimation extends View {
    constructor(options) {
        super(options);

        this.animation = options.animation;
        this.relative_path = options.relative_path;
        this.current_frame_index = 0;

        this.element.style.background = `url(${this.relative_path})`;
        this.element.style.width = this.model.width + 'px';
        this.element.style.height = this.model.height + 'px';
        this.element.style.display = 'inline-block';
    }
    render() {
        const frame = this.animation.frames[this.current_frame_index];
        const tile = this.model.tiles[frame.index];

        this.element.style['background-position'] = `-${tile.css_offset_x}px -${tile.css_offset_y}px`;

        this.current_frame_index += 1;
        if (this.current_frame_index >= this.animation.frames.length) {
            this.current_frame_index = 0;
        }
        setTimeout(this.render.bind(this), frame.duration);
    }
}

class SpriteAnimationEditor extends View {
    constructor(options) {
        super(options);
    }
    render() {
        //
    }
}

class SpriteEditor extends View {
    get events() {
        return {
            'click #save_sprite_sheet_button': this.save.bind(this),
            'click .sprite_animation_selector': this.select_animation.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game = options.game;
        this.original_path = path.join(this.game.path, 'images', 'sprite_sheets', this.model.sprite_sheet.path);
        this.template = Handlebars.compile(edit_sprite_tmpl);
    }
    select_sprite_sheet() {
        // TODO: This should just be a selector to select from the sprite sheets.
    }
    save(event) {
        event.preventDefault();
        event.stopPropagation();

        // TODO
    }
    render_grid() {
        console.log(this.model);
        const sprite_sheet = this.model.sprite_sheet;
        this.element.querySelector('#sprite_sheet_grid').innerHTML = '';
        const tiles_x = Math.floor(sprite_sheet.width / sprite_sheet.tile_width);
        const tiles_y = Math.floor(sprite_sheet.height / sprite_sheet.tile_height);

        let y_index = 0;
        let x_index = 0;
        for (y_index = 0; y_index < tiles_y; y_index += 1) {
            for (x_index = 0; x_index < tiles_x; x_index += 1) {
                const x = x_index * sprite_sheet.tile_width;
                const y = y_index * sprite_sheet.tile_height;
                const div = document.createElement('div');
                div.classList.add('grid_cell');
                div.style.left = x + 'px';
                div.style.top = y + 'px';
                div.style.width = (sprite_sheet.tile_width - 2) + 'px';
                div.style.height = (sprite_sheet.tile_height - 2) + 'px';
                this.element.querySelector('#sprite_sheet_grid').appendChild(div);
            }
        }
    }
    select_animation(event) {
        const id = event.target.dataset.id;
        console.log("Select Animation: ", id);
        const animation = this.model.animations[id];
        console.log("Animation: ", animation);
        // {time: 800, frames: [{duration: 100, index 0}]}
    }
    render() {
        const render_data = this.model.serialize();
        render_data.original_path = this.original_path;
        render_data.game_path = this.game.path;
        console.log("Render Data: ", render_data);
        this.element.innerHTML = this.template(render_data);

        const relative_path = `../${this.game.id}/data/images/sprite_sheets/${this.model.sprite_sheet.path}`;
        this.element.querySelectorAll('.sprite_animation_selector').forEach(element => {
            const id = element.dataset.id;
            console.log("Animation: ", id);
            const animation = this.model.animations[id];

            const animation_view = new SpriteAnimation({
                model: this.model,
                animation: animation,
                relative_path: relative_path,
                element: element.querySelector('.animation_preview')
            });
            animation_view.render();
        });

        this.render_grid();
    }
}

module.exports = SpriteEditor;
