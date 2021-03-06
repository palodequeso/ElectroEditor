'use strict';

const fs = require('fs');
const path = require('path');

const Handlebars = require('handlebars');
const View = require('exo').View;
const sidebar_tmpl = fs.readFileSync(path.join(__dirname, '/../tmpl/sidebar.html'), 'utf8');

class Sidebar extends View {
    get class_name() {
        return 'side_toolbar';
    }
    constructor(options) {
        super(options);
        this.template = Handlebars.compile(sidebar_tmpl);
        this.drag_data = {
            mouse: [0, 0],
            dragging: false
        };
    }
    resize_start(event) {
        this.drag_data.dragging = true;
        this.drag_data.mouse = [event.pageX, event.pageY];
    }
    resize_end(event) {
        this.drag_data.dragging = false;
        this.drag_data.mouse = [event.pageX, event.pageY];
    }
    resize(event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.drag_data.dragging && event.pageX && event.pageY) {
            const dx = event.pageX - this.drag_data.mouse[0];
            this.drag_data.mouse = [event.pageX, event.pageY];
            this.element.style.width = this.element.style.width - dx;
            this.emit('resize', this.element.style.width);
        }

        return false;
    }
    render_content(container) {
        const div = document.createElement('div');
        div.innerHTML = 'test';
        container.appendChild(div);
    }
    render() {
        this.element.classList.add('side_toolbar');
        this.element.innerHTML = sidebar_tmpl;
        // new Draggable(this.$element.find('.sidebar_handle'), {
            // onDrag: this.resize.bind(this)
        // });
        const sidebar_handle = this.element.querySelector('.sidebar_handle');
        sidebar_handle.ondragstart = this.resize_start.bind(this);
        sidebar_handle.ondrag = this.resize.bind(this);
        sidebar_handle.ondragend = this.resize_end.bind(this);
        this.render_content(this.element.querySelector('.sidebar_content'));
    }
}

module.exports = {
    Sidebar: Sidebar
};
