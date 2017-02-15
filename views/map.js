'use strict';

const {dialog} = require('electron').remote;

const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const Handlebars = require('handlebars');
const View = require('exo').View;
const edit_map_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/edit_map.html'), 'utf8');
const map_editor_tools_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/map_editor_tools.html'), 'utf8');

const Electro = require('electroengine');
const SpriteSheet = Electro.models.graphics.SpriteSheet;
const SpriteSheets = Electro.models.graphics.SpriteSheets;
// var SpriteSheet = require('../../engine/models/graphics/sprite_sheet.js');
// var SpriteSheets = require('../../engine/models/graphics/sprite_sheets.js');

const Sidebar = require('./util.js').Sidebar;

class MapEditorTools extends Sidebar {
    constructor(options) {
        super(options);
        this.game = options.game;
        this.template = Handlebars.compile(map_editor_tools_tmpl);
    }
    render_content(content) {
        const map_data = this.model.serialize();
        map_data.sprite_sheets.forEach((sheet) => {
            const sprite_sheets_path = path.normalize(path.join(this.game.path, '/images/sprite_sheets/', sheet.path));
            console.log("Sprite Sheets Path: ", sprite_sheets_path);
            sheet.modified_path = sprite_sheets_path;
            sheet.modified_path = path.relative(path.normalize(path.join(__dirname, '/../')), sprite_sheets_path);
            sheet.modified_path = sheet.modified_path.replace(/\\/gmi, '/');
            console.log("Modified Path: ", sheet.modified_path);
            sheet.tiles_x = sheet.width / sheet.tile_width;
            sheet.tiles_y = sheet.height / sheet.tile_height;
        });

        console.log("Map Data: ", map_data);

        setTimeout(() => {
            content.innerHTML = this.template(map_data);

            new hx.Collapsible('#layer_selector');
            new hx.DragContainer('#layer_selector_draggable_container');

            new hx.Collapsible('#sprite_selector');
            if (map_data.sprite_sheets.length) {
                new hx.Tabs('#sprite_sheet_tabs');
            }

            new hx.Collapsible('#map_properties');

            map_data.sprite_sheets.forEach((sheet) => {
                const tile_div = document.getElementById(`#sprite_sheet_${sheet.id}_content`)
                    .querySelector('.sprite_selector_tiles');
                console.log(tile_div);
                tile_div.style.width = sheet.width;
                tile_div.style.height = sheet.height;

                const i = 0;
                const j = 0;
                const tile_index = 0;
                for (j = 0; j < (sheet.height / sheet.tile_height); j += 1) {
                    for (i = 0; i < (sheet.width / sheet.tile_width); i += 1) {
                        const div = document.createElement('div');
                        div.classList.add('sprite_sheet_tile_selector');
                        div.style.width = sheet.tile_width;
                        div.style.height = sheet.tile_height;
                        div.dataset.tile_index = tile_index;
                        div.dataset.sprite_sheet_id = sheet.id;
                        tile_div.appendChild(div);
                        tile_index += 1;
                    }
                }
            });
        }, 100);
    }
}

class MapEditor extends View {
    get events() {
        return {
            'click #add_sprite_sheet_button': this.add_sprite_sheet.bind(this),
            'change .sprite_sheet_tile_width': this.tile_size_change.bind(this),
            'change .sprite_sheet_tile_height': this.tile_size_change.bind(this),
            'click .sprite_sheet_tile_selector': this.select_tile.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game = options.game;
        console.log(options);

        if (this.model.sprite_sheets === null) {
            this.model.sprite_sheets = new SpriteSheets();
        }

        this.tools = new MapEditorTools({
            game: this.game,
            model: this.model
        });
        console.log(this.tools);
        // this.tools.on('resize', this.tools_resize.bind(this));
    }
    tools_resize(width) {
        this.element.querySelector("#map_editor_tiles").style.width = `calc(100% - ${width}px)`;
    }
    tile_size_change(event) {
        const elem = event.currentTarget;
        const id = elem.dataset.id;
        const value = elem.value;
        console.log("Tile Size Change: ", id, value);
    }
    add_sprite_sheet() {
        console.log("Add Sprite Sheet");
        const choice = dialog.showOpenDialog({properties: ['openFile'], filters: [
            {name: 'Images', extensions: ['png']}
        ]});
        if (choice === undefined) {
            return;
        }

        choice = choice[0];

        console.log(this.game.path, choice);
        const sprite_sheets_path = path.normalize(this.game.path + '/sprite_sheets/' + path.basename(choice));
        console.log("SPrite Sheet Path: ", sprite_sheets_path);
        const dimensions = sizeOf(choice);
        console.log(choice, sprite_sheets_path, dimensions);
        console.log("Copy", choice, "to", sprite_sheets_path);
        fs.createReadStream(choice).pipe(fs.createWriteStream(sprite_sheets_path));

        const sprite_sheet = new SpriteSheet({
            id: path.basename(choice).replace('.', ''),
            name: path.basename(choice),
            path: path.basename(choice),
            width: dimensions.width,
            height: dimensions.height
        });
        this.model.sprite_sheets.add(sprite_sheet);
        this.render();
    }
    select_tile(event) {
        const elem = event.currentTarget;
        const tile_index = parseInt(elem.dataset.tile_index, 10);
        const sprite_sheet_id = elem.dataset.sprite_sheet_id;
        console.log("Select Tile: ", tile_index, sprite_sheet_id);
    }
    render() {
        this.element.innerHTML = edit_map_tmpl;

        this.tools.render();
        this.element.querySelector("#map_editor_container").appendChild(this.tools.element);

        const tiles = this.element.querySelector('#map_editor_tiles');
        tiles.innerHTML = '';
        const editor_div = document.createElement('div');

        let i = 0;
        let j = 0;
        let tile_index = 0;
        for (j = 0; j < this.model.height; j += 1) {
            for (i = 0; i < this.model.width; i += 1) {
                const div = document.createElement('div');
                div.classList.add('map_tile');
                div.dataset.tile_index = tile_index;
                div.style.width = this.model.tile_width;
                div.style.height = this.model.tile_height;
                editor_div.appendChild(div);
                tile_index += 1;
            }
        }

        editor_div.width = this.model.tile_width * this.model.width;
        editor_div.height = this.model.tile_height * this.model.height;
        tiles.appendChild(editor_div);
    }
}

module.exports = MapEditor;
