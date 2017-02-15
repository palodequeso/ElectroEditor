'use strict';

const {dialog} = require('electron').remote;

const View = require('exo').View;
const Electro = require('electroengine');

const game_model = Electro.models.Game;
const game_views = require('./game.js');
const gameio = Electro.util.gameio;

const Map = Electro.models.maps.Map;
const MapEditor = require('./map.js');

const SpriteSheet = Electro.models.graphics.SpriteSheet;
const SpriteSheetEditor = require('./sprite_sheet.js');

const Sprite = Electro.models.graphics.Sprite;
const SpriteEditor = require('./sprite.js');
const AnimationEditor = require('./animation.js');

const Character = Electro.models.characters.Character;
const CharacterEditor = require('./character.js');

const ParticleSystem = Electro.models.particle_systems.ParticleSystem;
const ParticleSystemEditor = require('./particle_system.js');

class App extends View {
    get events() {
        return {
            'click #edit_game_button': this.edit_game.bind(this),
            'click #save_game_button': this.save_game.bind(this),
            'click #build_game_button': this.build_game.bind(this),
            'click #create_game_button': this.create_game.bind(this),
            'click #load_game_button': this.load_game.bind(this),
            'click #create_map_button': this.create_map.bind(this),
            'click #create_sprite_sheet_button': this.create_sprite_sheet.bind(this),
            'click #create_particle_system_button': this.create_particle_system.bind(this),
            'click #create_character_button': this.create_character.bind(this),
            'click #create_sprite': this.create_sprite.bind(this),
            'click .select_map': this.select_map.bind(this),
            'click .select_character': this.select_character.bind(this),
            'click .select_particle_system': this.select_particle_system.bind(this),
            'click .select_sprite_sheet': this.select_sprite_sheet.bind(this),
            'click .select_sprite': this.select_sprite.bind(this),
            'click .select_sprite_animation': this.select_sprite_animation.bind(this)
        };
    }
    constructor(options) {
        super(options);
        this.game_model = null;
        this.preload_game_path = options.preload_game_path;
    }
    edit_game() {
        //
    }
    save_game() {
        gameio.save(this.game_model);
    }
    build_game() {
        //
    }
    create_game() {
        const gv = new game_views.CreateGameView({
            model: new game_model()
        });
        gv.render();

        gv.once('created', () => {
            this.game_model = gv.model;
            this.render();
        });

        this.element.querySelector(".content").innerHTML = '';
        this.element.querySelector(".content").appendChild(gv.element);
    }
    load_game(path) {
        if (path === undefined) {
            const choice = dialog.showOpenDialog({properties: ['openDirectory']});
            path = choice[0];
        }
        const game_loader = new gameio.GameLoader(path, game_model);
        console.log(path, game_loader.game);
        this.game_model = game_loader.game;
        this.render();
        this.create_particle_system();
    }
    create_map() {
        const model = new Map();
        const view = new MapEditor({
            model: model,
            game: this.game_model
        });

        this.game_model.maps.add(model);

        this.element.querySelector(".content").innerHTML = '';
        this.element.querySelector(".content").appendChild(view.element);

        view.render();
    }
    select_map(event) {
        const id = event.target.dataset.id;
        const map = this.game_model.maps.get(id);
        const view = new MapEditor({
            model: map,
            game: this.game_model
        });

        this.element.querySelector(".content").innerHTML = '';
        this.element.querySelector(".content").appendChild(view.element);

        view.render();
    }
    create_character() {
        const character = new Character();
        const view = new CharacterEditor({
            model: character,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    select_character(event) {
        const id = event.target.dataset.id;
        const character = this.game_model.characters.get(id);
        const view = new CharacterEditor({
            model: character,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    create_particle_system() {
        const particle_system = new ParticleSystem({
            id: "new_particle_system",
            name: "new_particle_system",
            image: 'particle.png'
        });
        const view = new ParticleSystemEditor({
            model: particle_system,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    select_particle_system(event) {
        const id = event.target.dataset.id;
        const particle_system = this.game_model.particle_systems.get(id);
        const view = new ParticleSystemEditor({
            model: particle_system,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    create_sprite_sheet() {
        const model = new SpriteSheet();
        const view = new SpriteSheetEditor({
            model: model,
            game: this.game_model
        });

        this.game_model.sprite_sheets.add(model);

        this.element.querySelector(".content").innerHTML = '';
        this.element.querySelector(".content").appendChild(view.element);

        view.render();
    }
    select_sprite_sheet(event) {
        const id = event.target.dataset.id;
        const sprite_sheet = this.game_model.sprite_sheets.get(id);
        console.log(sprite_sheet, this.game_model);
        const view = new SpriteSheetEditor({
            model: sprite_sheet,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    create_sprite() {
        const model = new Sprite();
        const view = new SpriteEditor({
            model: model,
            game: this.game_model
        });

        this.game_model.sprites.add(model);

        this.element.querySelector(".content").innerHTML = '';
        this.element.querySelector(".content").appendChild(view.element);

        view.render();
    }
    select_sprite(event) {
        const id = event.target.dataset.id;
        const sprite = this.game_model.sprites.get(id);

        const view = new SpriteEditor({
            model: sprite,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    select_sprite_animation(event) {
        const id = event.target.dataset.id;
        const sprite_id = event.target.dataset['sprite-id'];
        const sprite = this.game_model.sprites.get(sprite_id);

        const view = new AnimationEditor({
            model: sprite,
            animation_id: id,
            game: this.game_model
        });

        this.element.querySelector('.content').innerHTML = '';
        this.element.querySelector('.content').appendChild(view.element);

        view.render();
    }
    create_sprite_animation() {
        //
    }
    render() {
        if (this.game_model === null) {
            if (this.preload_game_path !== null) {
                setTimeout(() => {
                    this.load_game(this.preload_game_path);
                }, 250);
            }
            return;
        }

        const items = [
            {name: 'Maps', type: 'category', children: []},
            {name: 'Characters', type: 'category', children: []},
            {name: 'Particle Systems', type: 'category', children: []},
            {name: 'Sprites', type: 'category', children: []}
        ];

        this.game_model.maps.each(map => {
            items[0].children.push({
                type: 'map',
                name: map.name,
                id: map.id
            });
        });

        this.game_model.characters.each(character => {
            items[1].children.push({
                type: 'character',
                name: character.name,
                id: character.id
            });
        });

        this.game_model.particle_systems.each(particle_system => {
            items[2].children.push({
                type: 'particle_system',
                name: particle_system.name,
                id: particle_system.id
            });
        });

        this.sprite_sheet_sprites = {};
        this.game_model.sprites.each(sprite => {
            if (!this.sprite_sheet_sprites.hasOwnProperty(sprite.sprite_sheet_id)) {
                this.sprite_sheet_sprites[sprite.sprite_sheet_id] = [];
            }
            this.sprite_sheet_sprites[sprite.sprite_sheet_id].push(sprite);
        });

        this.game_model.sprite_sheets.each(/* sprite_sheet */ () => {
            // const sprite_sheet_children = [];
            // const sprites = this.sprite_sheet_sprites[sprite_sheet.id];

            // sprites.forEach(sprite => {
            //     let sprite_children = [];
            //
            //     Object.keys(sprite.animations).forEach(animation_id => {
            //         sprite_children.push({
            //             type: 'sprite_animation',
            //             id: animation_id,
            //             sprite_id: sprite.id
            //         });
            //     });
            //
            //     sprite_sheet_children.push({
            //         type: 'sprite',
            //         id: sprite.id,
            //         children: sprite_children
            //     });
            // });

            // items[3].children.push({
            //     type: 'sprite_sheet',
            //     name: sprite_sheet.name,
            //     id: sprite_sheet.id,
            //     children: sprite_sheet_children
            // });
        });

        /* const tree = */ new hx.Tree('#game_navigation', {
            renderer: function(elem, data) {
                console.log(elem);
                let icon;
                if (data.type === 'category') {
                    hx.select(elem).html(data.name);
                } else if (data.type === 'map') {
                    icon = '<i class="fa fa-map"></i> ';
                    hx.select(elem).html(icon + data.name).attr('class', 'select_map').attr('data-id', data.id);
                } else if (data.type === 'character') {
                    icon = '<i class="fa fa-user"></i> ';
                    hx.select(elem).html(icon + data.name).attr('class', 'select_character').attr('data-id', data.id);
                } else if (data.type === 'particle_system') {
                    icon = '<i class="fa fa-fire"></i> ';
                    hx.select(elem).html(icon + data.name).attr('class', 'select_particle_system')
                        .attr('data-id', data.id);
                } else if (data.type === 'sprite_sheet') {
                    icon = '<i class="fa fa-object-group"></i> ';
                    hx.select(elem).html(icon + data.name).attr('class', 'select_sprite_sheet')
                        .attr('data-id', data.id);
                } else if (data.type === 'sprite') {
                    icon = '<i class="fa fa-puzzle-piece"></i> ';
                    hx.select(elem).html(icon + data.id).attr('class', 'select_sprite').attr('data-id', data.id);
                } else if (data.type === 'sprite_animation') {
                    icon = '<i class="fa fa-motorcycle"></i> ';
                    hx.select(elem).html(icon + data.id).attr('class', 'select_sprite_animation')
                        .attr('data-id', data.id).attr('data-sprite-id', data.sprite_id);
                }
            },
            items: items
        });
    }
}

module.exports = App;
