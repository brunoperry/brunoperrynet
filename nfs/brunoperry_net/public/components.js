class Component extends HTMLElement {
    constructor(template) {
        super();

        this.view = this.attachShadow({ mode: 'open' });
        this.view.innerHTML = template;
    }

    connectedCallback() {

        if (this.hasAttribute('b-color')) this.style.backgroundColor = this.getAttribute('b-color');
        this.style.opacity = 1;

        if (this.hasAttribute('width')) this.style.maxWidth = this.getAttribute('width');
        if (this.hasAttribute('height')) this.style.maxHeight = this.getAttribute('height');
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