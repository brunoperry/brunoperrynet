class Component extends HTMLElement {
    constructor(template) {
        super();

        this.view = this.attachShadow({ mode: 'open' });
        this.view.innerHTML = template;
    }

    connectedCallback() {

        if (this.hasAttribute('b-color')) this.style.backgroundColor = this.getAttribute('b-color');

        if (this.hasAttribute('width')) this.style.maxWidth = this.getAttribute('width');
        if (this.hasAttribute('height')) this.style.maxHeight = this.getAttribute('height');

        this.style.opacity = 1;
    }
    attributeChangedCallback(name, oldValue, newValue) {

    }
}
Component.Events = {
    CLICK: 'componenteventclick',
    LIST_CLICK: 'componeteventlistclick'
}
Component.SPEED = null;

class SimpleButton extends Component {

    constructor(template = '') {
        super(`
        <slot name="label"></slot>
        ${template}
        `);

        this.buttonLabel = null;
        this.buttonData = null;
    }

    onClick() {
        this.dispatchEvent(new CustomEvent(Component.Events.CLICK, {
            bubbles: true,
            detail: this.value
        }));
    }
    connectedCallback() {

        this.buttonLabel = document.createElement('label');
        this.buttonLabel.setAttribute('slot', 'label');
        this.buttonLabel.innerText = this.getAttribute('label');
        this.appendChild(this.buttonLabel);

        if (this.hasAttribute('f-size')) this.buttonLabel.style.fontSize = this.getAttribute('f-size');
        if (this.hasAttribute('f-weight')) this.buttonLabel.style.fontWeight = this.getAttribute('f-weight');
        if (this.hasAttribute('f-color')) this.buttonLabel.style.color = this.getAttribute('f-color');
        if (this.hasAttribute('t-align')) this.style.justifyContent = this.getAttribute('t-align');

        this.addEventListener('click', () => this.onClick());

        setTimeout(() => {
            super.connectedCallback();
        }, 10);
    }

    get label() { return this.buttonLabel.innerText }
    set label(value) { this.setAttribute('label', value) }

    get value() { return this.buttonLabel.innerText }
    set value(val) { this.buttonLabel.innerText = val }

    get data() { return this.buttonData; }
    set data(val) { this.buttonData = val; }
}
customElements.define('simple-button', SimpleButton);

class IconButton extends Component {

    constructor() {
        super(`
        <slot name="label"></slot>
        <slot name="icon"></slot>
        `)

        this.buttonLabel = null;
        this.buttonIcon = null;
    }
    connectedCallback() {

        if (this.hasAttribute('label')) {
            this.buttonLabel = document.createElement('label');

            this.buttonLabel.setAttribute('slot', 'label');
            this.buttonLabel.innerText = this.getAttribute('label');

            this.style.justifyContent = 'space-between';
            this.style.display = 'grid';
            this.style.gridTemplateColumns = 'auto var(--button-height)'
            this.appendChild(this.buttonLabel);
        }

        this.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent(Component.Events.CLICK, {
                bubbles: true,
                detail: this.value
            }));
        });

        setTimeout(() => {
            this.buttonIcon = this.querySelector('.icon-container');
            super.connectedCallback();
        }, 10);
    }
    get label() {
        if (this.buttonLabel) return this.buttonLabel.innerText;
        return 'no label';
    }
    set label(value) { this.setAttribute('label', value) }

    get icon() { return this.buttonIcon.querySelector('svg'); }
    set icon(ico) { this.buttonIcon.innerHTML = ico; }
}
customElements.define('icon-button', IconButton);

class ToggleButton extends SimpleButton {

    constructor() {
        super(`
        <slot name="icons"></slot>
        `);

        this.buttonIcons = null;
        this.currentToggleIndex = 0;
        this.numToggles = 0;
    }
    connectedCallback() {

        setTimeout(() => {

            this.buttonIcons = this.querySelector('.icons-container');

            if (this.buttonIcons) this.numToggles = this.buttonIcons.children.length;

            if (this.hasAttribute('toggle')) this.currentToggleIndex = parseInt(this.getAttribute('toggle'));
            this.toggle(this.currentToggleIndex);


            super.connectedCallback();
        }, 10);
    }
    onClick() {
        this.toggle();
        super.onClick();
    }

    toggle(toggleIndex = null) {
        if (toggleIndex !== null) {
            this.currentToggleIndex = toggleIndex;
        } else {
            this.currentToggleIndex++;
        }
        if (this.currentToggleIndex >= this.numToggles) {
            this.currentToggleIndex = 0;
        }

        if (!this.buttonIcons) return;

        for (let i = 0; i < this.buttonIcons.children.length; i++) {
            this.buttonIcons.children[i].style.display = 'none';
        }
        this.buttonIcons.children[this.currentToggleIndex].style.display = 'initial';
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log('qlwjk')
    }

    get label() { return this.buttonLabel.innerText }
    set label(value) { this.setAttribute('label', value) }

    get value() { return this.currentToggleIndex }
    set value(value) {
        this.toggle(value);
    }
}
customElements.define('toggle-button', ToggleButton);


class SimpleList extends Component {

    constructor() {
        super(`
        <slot name="list"></slot>
    `);

        this.list = null;
        this.currentItem = null;
        this.listData = null;
        this.listItems = [];
    }

    buildList(listData) {

        this.listData = listData;

        for (let i = 0; i < listData.length; i++) {
            const itemData = listData[i];
            const li = document.createElement('li');
            let button = null;
            if (itemData.buttonElem) {
                button = itemData.buttonElem;
            } else {
                button = document.createElement('simple-button');
                button.setAttribute('label', itemData.name);
            }
            button.data = itemData;
            button.onclick = () => {
                this.currentItem = button;
                this.dispatchEvent(new CustomEvent(SimpleList.Events.CLICK, { bubbles: true, detail: itemData }))
            }
            li.appendChild(button);

            this.listItems.push(button);

            this.list.appendChild(li);
        }
    }

    connectedCallback() {

        this.list = document.createElement('ul');
        this.list.setAttribute('slot', 'list');
        this.appendChild(this.list);

        setTimeout(() => {
            super.connectedCallback();
        }, 10);
    }

    get data() { return this.currentItem.data }
    get items() { return this.listItems }
}
SimpleList.Events = {
    CLICK: 'simplelisteventsclick'
}
customElements.define('simple-list', SimpleList);
class ExpandableList extends Component {

    constructor() {
        super(`
            <slot name="toggle"></slot>
            <slot name="list"></slot>
        `);

        this.toggleButton = null;
        this.list = null;
        this.listItems = null;
        this.listHeight = 0;

        this.listData = null;

        this.isExpanded = false;
    }

    expand(andToggle = false) {
        if (this.isExpanded) return;
        if (andToggle) this.toggleButton.toggle();

        this.list.style.height = this.listHeight;
        this.isExpanded = true;
        this.dispatchEvent(new CustomEvent(ExpandableList.Events.EXPANDED));
    }

    collapse(andToggle = false) {
        if (!this.isExpanded) return;
        if (andToggle) this.toggleButton.toggle();

        this.list.style.height = 0;
        this.isExpanded = false;
        this.dispatchEvent(new CustomEvent(ExpandableList.Events.COLLAPSE));
    }

    connectedCallback() {
        setTimeout(() => {
            this.toggleButton = this.querySelector('toggle-button');
            this.toggleButton.addEventListener(Component.Events.CLICK, e => {
                if (this.isExpanded) this.collapse();
                else this.expand();
            });
            this.list = this.querySelector('ul');
            super.connectedCallback();
        }, 10);
    }

    buildList(listData) {

        this.listData = listData;
        this.listHeight = 0;
        this.list.innerHTML = '';

        for (let i = 0; i < this.listData.length; i++) {
            const itemData = this.listData[i];

            const li = document.createElement('li');

            let button = null;
            if (itemData.buttonElem) {
                button = itemData.buttonElem;
            } else {
                button = document.createElement('simple-button');
                button.setAttribute('label', itemData.name);
            }
            button.onclick = () => {
                this.dispatchEvent(new CustomEvent(ExpandableList.Events.CLICK, { bubbles: true, detail: itemData }))
            }
            li.appendChild(button);

            this.list.appendChild(li);
            this.listHeight += li.offsetHeight;
        }
        this.listItems = this.list.children;
        this.listHeight += 'px';

        if (this.isExpanded) this.list.style.height = this.listHeight;
    }

    get data() { return this.listData }
    set data(listData) { this.listData = listData }
}
ExpandableList.Events = {
    CLICK: 'expandablelisteventclick',
    EXPANDED: 'expandablelisteventexpanded',
    COLLAPSE: 'expandablelisteventcollapse'
}
customElements.define('expandable-list', ExpandableList);

class SelectGroup extends Component {

    constructor() {
        super(`
            <slot name="group"></slot>
        `)

        this.groupType = 'singlechoice';
        this.selectGroupData = null;
        this.groupContainer = null;

        this.groupData = null;

        this.currentItem = null;
        this.initialItem = null;
    }

    connectedCallback() {

        if (this.hasAttribute('type')) this.groupType = this.getAttribute('type');
        if (this.hasAttribute('toggle')) this.initialItem = parseInt(this.getAttribute('toggle'));

        this.groupContainer = document.createElement('div');
        this.groupContainer.className = 'select-group-container';
        this.groupContainer.setAttribute('slot', 'group');
        this.appendChild(this.groupContainer)

        setTimeout(() => {
            if (this.groupData) this.setData(this.groupData);
            super.connectedCallback();
        }, 10);
    }

    setData(data, selectItem = null) {

        this.groupData = data;

        if (!this.groupContainer) return;

        this.groupContainer.innerHTML = '';

        const buttonTemplate = document.querySelector('.buttons-template');
        let buttonClassName = '';
        switch (this.groupType) {
            case 'singlechoice':
                buttonClassName = '.radio-button';
                break;
            case 'multiplechoice':
                buttonClassName = '.checkbox-button';
                break;
        }

        for (let i = 0; i < this.groupData.length; i++) {
            const itemData = this.groupData[i];
            const btn = buttonTemplate.content.cloneNode(true).querySelector(buttonClassName);
            btn.setAttribute('label', itemData);
            btn.setAttribute('value', itemData);

            if (this.initialItem !== null && this.initialItem === i || selectItem !== null && selectItem === itemData) {
                btn.setAttribute('toggle', 1);
                this.currentItem = btn;
            }

            btn.addEventListener(Component.Events.CLICK, e => {
                if (this.groupType === 'singlechoice') {
                    if (this.currentItem) this.currentItem.toggle();
                    this.currentItem = btn;
                }
                this.dispatchEvent(new CustomEvent(SelectGroup.Events.CHANGED), { bubbles: true, detail: itemData });
            });
            this.groupContainer.appendChild(btn);
        };
    }

    get value() {
        if (this.groupType === 'singlechoice') {
            return this.currentItem.getAttribute('value')
        } else {
            let data = [];
            for (let i = 0; i < this.groupContainer.children.length; i++) {
                data.push(this.groupContainer.children[i].value)
            }
            return data;
        }
    }
    set value(val) { this.currentItem.setAttribute('value', val) }

    get data() {

    }
    set data(val) {

    }
}
SelectGroup.Events = {
    CHANGED: 'selectgroupeventchanged'
}
customElements.define('select-group', SelectGroup);

class ModalWindow extends Component {

    constructor() {
        super(`
             <slot name="content"></slot>
        `);

        this.cancelButton = null;
        this.okButton = null;
        this.titleElem = null;
        this.messageElem = null;
        this.contentElem = null;
        this.callback = null;

        this.shrinkElem = null;
    }

    connectedCallback() {
        setTimeout(() => {
            this.cancelButton = this.querySelector('.cancel-button');
            this.cancelButton.addEventListener(Component.Events.CLICK, e => {
                if (this.callback) this.callback('cancel');
            });
            this.okButton = this.querySelector('.ok-button');
            this.okButton.addEventListener(Component.Events.CLICK, e => {
                if (this.callback) this.callback('ok');
            });
            this.titleElem = this.querySelector('.title');
            this.messageElem = this.querySelector('.message');
            this.contentElem = this.querySelector('.modal-content');
            super.connectedCallback();
        }, 10);
    }

    show(shrinkElem = null) {

        this.shrinkElem = shrinkElem;
        if (this.shrinkElem) {
            this.shrinkElem.style.transform = 'scale3d(0.9,0.9,0.9)';
        }
        this.style.visibility = 'visible';
        this.style.transform = 'scale3d(1,1,1)';
        setTimeout(() => {
            this.contentElem.style.opacity = 1;
        }, Component.SPEED);
    }

    hide() {
        if (this.shrinkElem) {
            this.shrinkElem.style.transform = 'scale3d(1,1,1)';
        }
        this.contentElem.style.opacity = 0;
        this.style.transform = 'scale3d(0,0,0)';
        setTimeout(() => {
            this.shrinkElem = null;
            this.style.visibility = 'hidden';
        }, Component.SPEED);
    }

    setData(modalData) {
        this.titleElem.style.display = 'flex';
        this.titleElem.innerText = '';
        if (modalData.title) this.titleElem.innerText = modalData.title;
        else this.titleElem.style.display = 'none';

        this.messageElem.innerText = modalData.message;

        this.callback = modalData.callback;

        this.cancelButton.style.display = 'none';
        this.okButton.style.display = 'none';
        if (modalData.actions.includes('cancel')) this.cancelButton.style.display = 'flex';
        if (modalData.actions.includes('ok')) this.okButton.style.display = 'flex';
    }
}
customElements.define('modal-window', ModalWindow);

class RangeSlider extends Component {

    constructor() {
        super(`
            <slot name="input"></slot>
            <slot name="bar"></slot>
            <slot name="label"></slot>
        `);

        this.input = null;
        this.bar = null;
        this.label = null;

        this.maxVal = 1;
        this.minVal = 0;

        this.labelOn = false;
    }

    connectedCallback() {

        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.slot = 'input';
        this.input.oninput = e => {
            this.bar.style.width = `${this.input.value}%`;
            if (!this.labelOn) this.label.innerText = '';
            else this.label.innerText = `${this.input.value}%`;
            this.dispatchEvent(new CustomEvent(RangeSlider.Events.CHANGED, { detail: this.input.value }))
        }
        this.input.onchange = e => {
            this.bar.style.width = `${this.input.value}%`;
            if (!this.labelOn) this.label.innerText = '';
            else this.label.innerText = `${this.input.value}%`;
            this.dispatchEvent(new CustomEvent(RangeSlider.Events.CHANGED, { detail: this.input.value }))
        }
        this.appendChild(this.input);

        this.bar = document.createElement('div');
        this.bar.className = 'range-bar';
        this.bar.slot = 'bar';
        this.appendChild(this.bar);

        this.label = document.createElement('label');
        this.label.className = 'range-label';
        this.label.setAttribute('slot', 'label');
        this.appendChild(this.label);

        if (this.hasAttribute('min')) this.input.min = parseInt(this.getAttribute('min'));
        if (this.hasAttribute('max')) this.input.max = parseInt(this.getAttribute('max'));
        if (this.hasAttribute('f-size')) this.label.style.fontSize = this.getAttribute('f-size');
        if (this.hasAttribute('f-weight')) this.label.style.fontWeight = this.getAttribute('f-weight');
        if (this.hasAttribute('t-align')) this.label.style.justifyContent = this.getAttribute('t-align');
        if (this.hasAttribute('label-on')) this.labelOn = true;
        if (this.hasAttribute('value')) {
            this.value = parseInt(this.getAttribute('value'));
        }

        if (this.input.max !== 100) {
            this.input.step = this.input.max / 100;
        }

        super.connectedCallback();
    }

    show() {
        this.style.visibility = 'visible';
        this.style.pointerEvents = 'initial';
    }

    hide() {
        this.style.visibility = 'hidden';
        this.style.pointerEvents = 'none';
    }

    get value() { return this.input.value }
    set value(val) {
        this.input.value = val;
        this.bar.style.width = `${val}%`;
    }
}
RangeSlider.Events = {
    CHANGED: 'rangeslidereventschanged'
}
customElements.define('range-slider', RangeSlider);

class MobileMenu extends Component {

    constructor() {
        super(`
            <slot name="lists"></slot>
            <slot name="button"></slot>
            <slot name="breadcrumb"></slot>
        `);

        this.isOpen = false;
        this.menuData = null;
        this.listsContainer = null;
        this.currentList = null;
        this.breadCrumb = null;
        this.menuButton = null;

        this.activeItems = [];
    }

    connectedCallback() {

        this.listsContainer = document.createElement('div');
        this.listsContainer.setAttribute('slot', 'lists');
        this.listsContainer.className = 'list-container';

        this.appendChild(this.listsContainer);

        setTimeout(() => {
            this.breadCrumb = this.querySelector('bread-crumb');
            this.breadCrumb.addEventListener(BreadCrumb.Events.CLICK, e => {
                this.previous(e.detail);
            })
            this.menuButton = this.querySelector('#menu-button');
            this.menuButton.addEventListener(Component.Events.CLICK, e => {
                if (this.isOpen) this.close();
                else this.open();
            })
        }, Component.SPEED);
    }

    update(menuData) {
        this.menuData = menuData;
    }

    addList(listData, now = false) {
        const list = document.createElement('simple-list');
        list.addEventListener(SimpleList.Events.CLICK, e => {
            this.dispatchEvent(new CustomEvent(SimpleList.Events.CLICK, {
                bubbles: true,
                detail: this.value
            }));
        });

        const itemTemplate = document.querySelector('#items-template');

        for (let i = 0; i < listData.length; i++) {
            const item = listData[i];
            let btn;
            if (item.children) {
                btn = itemTemplate.content.cloneNode(true).querySelector('.list-item');
            } else {
                btn = itemTemplate.content.cloneNode(true).querySelector('simple-button');
            }
            btn.index = i;
            btn.addEventListener(Component.Events.CLICK, e => {

                if (btn.data.type === 'directory') {
                    this.addList(btn.data.children)
                } else {
                    this.dispatchEvent(new CustomEvent(MobileMenu.Events.CLICK, {
                        detail: {
                            data: listData,
                            index: btn.index
                        }
                    }));
                    this.menuButton.click();
                }
            })
            btn.setAttribute('label', item.name);
            for (let j = 0; j < this.activeItems.length; j++) {
                if (this.activeItems[j] === listData[i].id) {
                    btn.className = 'active';
                    break;
                }
            }
            item.buttonElem = btn;
        }

        if (this.listsContainer.children.length > 0) {
            this.breadCrumb.show(this.currentList.data);
            list.style.marginTop = 'var(--button-height)';
        }
        this.listsContainer.appendChild(list);

        list.buildList(listData)
        if (now) {
            list.style.transition = 'none';
        }

        setTimeout(e => {

            if (this.currentList) this.currentList.style.transform = 'translateX(-100%)';
            list.style.transform = 'translateX(0)';

            if (now) {
                setTimeout(() => {
                    list.style.transition = 'transform var(--speed) ease-in-out';
                }, Component.SPEED);
            }
            this.currentList = list;
        }, 20)
    }

    previous(index = null) {

        if (index !== null) {
            const lists = this.listsContainer.children;
            let rmvs = [];
            for (let i = lists.length; i > 0; i--) {
                if (i - 1 === index) break;
                const l = lists[i - 1];
                rmvs.push(l);
                l.style.transform = 'translateX(100%)';
            }
            this.currentList = this.listsContainer.children[index];
            this.currentList.style.transform = 'translateX(0)';
            setTimeout(() => {
                for (let i = 0; i < rmvs.length; i++) {
                    this.listsContainer.removeChild(rmvs[i]);
                }

            }, Component.SPEED);
        } else {

            const l = this.currentList;
            l.style.transform = 'translateX(100%)';

            this.currentList = this.listsContainer.children[this.listsContainer.children.length - 2];
            this.currentList.style.transform = 'translateX(0)';
            setTimeout(() => {
                this.listsContainer.removeChild(l);
            }, Component.SPEED);
        }
    }

    next() {

    }

    open() {

        this.addList(this.menuData, true)

        this.isOpen = true;
        this.listsContainer.style.transform = 'translateY(0)';
        this.dispatchEvent(new CustomEvent(MobileMenu.Events.OPEN))
    }

    close() {

        this.dispatchEvent(new CustomEvent(MobileMenu.Events.CLOSE))
        if (this.breadCrumb.isOpen) this.breadCrumb.hide();

        this.isOpen = false;
        this.listsContainer.style.transform = 'translateY(100%)';
        setTimeout(() => {
            this.listsContainer.innerHTML = '';
            this.currentList = null;
        }, Component.SPEED);
    }

    setActiveItems(items) {

        this.activeItems = items;
        if (this.isOpen) {
            const currItems = this.currentList.items;
            for (let i = 0; i < currItems.length; i++) {
                const itm = currItems[i];
                for (let j = 0; j < this.activeItems.length; j++) {
                    if (this.activeItems[j] === itm.data.id) {
                        itm.className = 'active';
                    } else {
                        itm.className = '';
                    }
                }
            }
        }
    }

    get value() { return null }
}
MobileMenu.Events = {
    CLICK: 'mobilemenueventsclick',
    OPEN: 'mobilemenueventsopen',
    CLOSE: 'mobilemenueventsclose',
}
customElements.define('mobile-menu', MobileMenu);

class BreadCrumb extends Component {

    constructor() {
        super(`
            <slot name="buttons"></slot>
            <slot name="label"></slot>
        `)

        this.label = null;
        this.buttonsContainer = null;
        this.isOpen = false;
    }

    connectedCallback() {

        this.label = document.createElement('label');
        this.label.setAttribute('slot', 'label');

        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'buttons-container'
        this.buttonsContainer.setAttribute('slot', 'buttons');

        this.appendChild(this.label);
        this.appendChild(this.buttonsContainer);

        super.connectedCallback();
    }

    add(data) {
        const itemTemplate = document.querySelector('#items-template');
        let btn = itemTemplate.content.cloneNode(true).querySelector('.breadcrumb-item');
        btn.data = data;
        btn.index = this.buttonsContainer.children.length;
        btn.addEventListener(Component.Events.CLICK, e => {

            const btns = this.buttonsContainer.children;

            for (let i = btns.length; i > 0; i--) {
                const b = btns[i - 1];
                this.buttonsContainer.removeChild(b);
                if (b === btn) break;
            }
            if (this.buttonsContainer.children.length === 0) this.hide();
            else {
                this.label.innerText = btns[btn.index - 1].data.name;
            }
            this.dispatchEvent(new CustomEvent(BreadCrumb.Events.CLICK, { detail: btn.index }));
        })
        this.buttonsContainer.appendChild(btn);
        this.label.innerText = data.name;
    }

    show(data) {
        if (data) this.add(data);
        this.style.display = 'flex';
        setTimeout(() => {
            this.style.transform = 'translateY(0)';
        }, Component.SPEED);
        this.isOpen = true;
    }

    hide() {
        this.style.display = 'none';
        this.buttonsContainer.innerHTML = '';
        this.style.transform = 'translateY(-100%)';
        this.isOpen = false;
    }
}
BreadCrumb.Events = {
    CLICK: 'breadcrumbeventsclick'
}
customElements.define('bread-crumb', BreadCrumb);