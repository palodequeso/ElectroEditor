'use strict';

const {dialog} = require('electron').remote;

const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const fse = require('fs-extra');

const Handlebars = require('handlebars');
const View = require('exo').View;
const edit_sprite_sheet_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/edit_sprite_sheet.html'), 'utf8');

class SpriteSheetEditor extends View {
    get events() {
        return {
            'click #save_sprite_sheet_button': this.save.bind(this),
            'change .sprite_sheet_tile_width': this.adjust_tile_size.bind(this),
            'change .sprite_sheet_tile_height': this.adjust_tile_size.bind(this),
            'change .sprite_sheet_path': this.adjust_path.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game = options.game;
        this.original_path = path.join(this.game.path, 'images', 'sprite_sheets', this.model.path);
        this.template = Handlebars.compile(edit_sprite_sheet_tmpl);
    }
    select_sprite_sheet() {
        let choice = dialog.showOpenDialog({properties: ['openFile'], filters: [
            {name: 'Images', extensions: ['png']}
        ]});
        if (choice === undefined) {
            return;
        }

        choice = choice[0];

        // let sprite_sheets_path = path.normalize(this.game.path + '/images/sprite_sheets/' + path.basename(choice));
        this.original_path = 'file://' + choice;

        const dimensions = sizeOf(choice);
        // fs.createReadStream(choice).pipe(fs.createWriteStream(sprite_sheets_path));

        this.model.set({
            id: path.basename(choice).replace('.', ''),
            name: path.basename(choice),
            path: path.basename(choice),
            width: dimensions.width,
            height: dimensions.height,
            tile_width: 32,
            tile_height: 32
        });

        this.render();
    }
    save(event) {
        event.preventDefault();
        event.stopPropagation();

        // NOTE: Path, Width and Height should not be changable!
        const new_id = this.element.querySelector('.sprite_sheet_id').value;
        this.model.sheet_path = this.element.querySelector('.sprite_sheet_path').value;
        this.model.name = this.element.querySelector('.sprite_sheet_name').value;
        this.model.width = parseInt(this.element.querySelector('.sprite_sheet_width').value, 10);
        this.model.height = parseInt(this.element.querySelector('.sprite_sheet_height').value, 10);
        this.model.tile_width = parseInt(this.element.querySelector('.sprite_sheet_tile_width').value, 10);
        this.model.tile_height = parseInt(this.element.querySelector('.sprite_sheet_tile_height').value, 10);

        const current_path = path.normalize(path.join(this.game.path, 'sprite_sheets',
                                                    this.model.id.toString() + '.json'));
        const new_path = path.normalize(path.join(this.game.path, 'sprite_sheets',
                                                new_id + '.json'));
        this.model.id = new_id;

        if (current_path !== new_path) {
            fse.copySync(current_path, new_path);
        }

        let out = this.model.serialize();
        delete out.sprites;
        out = JSON.stringify(out, null, 4);
        fs.writeFileSync(new_path, out);
    }
    adjust_tile_size() {
        this.model.tile_width = parseInt(this.element.querySelector('.sprite_sheet_tile_width').value, 10);
        this.model.tile_height = parseInt(this.element.querySelector('.sprite_sheet_tile_height').value, 10);
        this.render_grid();
    }
    adjust_path() {
        this.model.path = this.element.querySelector('.sprite_sheet_path').value;
        this.original_path = path.join(this.game.path, 'images', 'sprite_sheets', this.model.path);
        this.render();
    }
    render_grid() {
        console.log(this.model);
        this.element.querySelector('#sprite_sheet_grid').innerHTML = '';
        const tiles_x = Math.floor(this.model.width / this.model.tile_width);
        const tiles_y = Math.floor(this.model.height / this.model.tile_height);

        let y_index = 0;
        let x_index = 0;
        for (y_index = 0; y_index < tiles_y; y_index += 1) {
            for (x_index = 0; x_index < tiles_x; x_index += 1) {
                const x = x_index * this.model.tile_width;
                const y = y_index * this.model.tile_height;
                const div = document.createElement('div');
                div.classList.add('grid_cell');
                div.style.left = x + 'px';
                div.style.top = y + 'px';
                div.style.width = (this.model.tile_width - 2) + 'px';
                div.style.height = (this.model.tile_height - 2) + 'px';
                this.element.querySelector('#sprite_sheet_grid').appendChild(div);
            }
        }
    }
    render() {
        const render_data = this.model.serialize();
        render_data.original_path = this.original_path;
        render_data.game_path = this.game.path;
        console.log("Render Data: ", render_data);
        this.element.innerHTML = this.template(render_data);

        if (this.model.path === "") {
            this.select_sprite_sheet();
        } else {
            this.render_grid();
        }
    }
}

module.exports = SpriteSheetEditor;
