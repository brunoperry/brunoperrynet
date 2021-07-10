class View {

    constructor(data) {
        this.view = data.view;
        this.callback = data.callback;
    }

    show() {
        this.view.style.visibility = 'visible';
        this.view.style.opacity = 1;
    }
    hide() {
        this.view.style.opacity = 0;
        this.view.style.visibility = 'hidden';
    }
}
class CPanelView extends View {

    constructor(callback) {
        super({
            view: document.querySelector('#cpanel-container'),
            callback: callback
        });

        this.appList = null;
        this.usersList = null;
    }

    async init() {
        try {
            let req = await fetch('/cpanel/getapps');
            let res = await req.json();

            console.log(res)

            let addButton = document.querySelector('.buttons-template').content.cloneNode(true).querySelector('icon-button');
            addButton.setAttribute('label', 'new app');
            res.push({
                action: 'newapp',
                buttonElem: addButton
            })

            this.appList = document.querySelector('#apps-list');
            this.appList.addEventListener(ExpandableList.Events.CLICK, e => {
                this.callback({
                    action: 'onappschange',
                    appData: e.detail
                });
            });
            this.updateApps(res)

            req = await fetch('/cpanel/getusers');
            res = await req.json();
            this.usersList = document.querySelector('#users-list');
            this.usersList.buildList(res);
            this.usersList.addEventListener(ExpandableList.Events.CLICK, e => {
                this.callback({
                    action: 'onuserschange',
                    userData: e.detail
                })
            });

            this.appList.addEventListener(ExpandableList.Events.EXPANDED, () => this.usersList.collapse(true));
            this.usersList.addEventListener(ExpandableList.Events.EXPANDED, () => this.appList.collapse(true));

            this.show();

        } catch (error) {
            console.error(error)
        }
    }

    updateApps(appsData) {
        this.appList.buildList(appsData);
    }

    updateUsers(usersData) {

    }

    show() {
        super.show();
        this.view.style.transform = 'scale(1)';
    }
    hide() {
        this.view.style.opacity = 0;
        this.view.style.transform = 'scale(0.9)';
        setTimeout(() => {
            super.hide();
        }, Component.SPEED)
    }
}
class AppEditView extends View {

    constructor(callback) {

        super({
            view: document.querySelector('#app-edit-container'),
            callback: callback
        });

        this.appID = this.view.querySelector('#app-id');
        this.appName = this.view.querySelector('#app-name');
        this.appShortName = this.view.querySelector('#app-short-name');
        this.appURL = this.view.querySelector('#app-url');
        this.appState = this.view.querySelector('#app-state');
        this.appType = this.view.querySelector('#app-type');
        this.appAdmin = this.view.querySelector('#app-admin');

        this.componentsContainer = this.view.querySelector('#components-container');
        this.appComponents = this.componentsContainer.querySelector('#app-components');
        this.appComponents.setData(['controller', 'model', 'config'], '');

        this.editContainer = this.view.querySelector('.edit-container');
        this.actionsContainer = this.view.querySelector('.actions-container');

        this.view.querySelector('#cancel-app-button').addEventListener(Component.Events.CLICK, e => this.callback('cancel'))
        this.view.querySelector('#save-app-button').addEventListener(Component.Events.CLICK, e => this.callback('save'));
        this.deleteAppButton = this.view.querySelector('#delete-app-button');
        this.deleteAppButton.addEventListener(Component.Events.CLICK, e => this.callback('delete'));
    }

    show() {
        super.show();
        this.editContainer.style.transform = 'scale(1)';
        this.actionsContainer.style.transform = 'translateY(0)';
    }

    hide() {
        this.view.style.opacity = 0;
        this.editContainer.style.transform = 'scale(0.9)';
        this.actionsContainer.style.transform = 'translateY(100%)';
        setTimeout(() => {
            this.view.querySelector('.edit-container').scrollTop = 0;
            super.hide();
        }, Component.SPEED);
    }

    resetView(data = null, isNew = false) {

        if (data.action !== 'newapp') {
            this.appID.innerText = `app id: ${data.id}`;
            this.appName.value = data.name;
            this.appShortName.value = data.short_name;
            this.appURL.value = data.url;
            this.appState.setData(['active', 'inactive', 'development'], data.state);
            this.appType.setData(['webapp', 'service', 'system'], data.type);
            this.appAdmin.value = data.admin;
        } else {
            this.appID.innerText = 'app id: ...';
            this.appName.value = '';
            this.appShortName.value = '';
            this.appURL.value = '';
            this.appState.setData(['active', 'inactive', 'development'], 'development');
            this.appType.setData(['webapp', 'service', 'system'], 'webapp');
            this.appAdmin.value = 0;
        }
        if (isNew) {
            this.deleteAppButton.style.display = 'none';
            this.componentsContainer.style.display = 'initial';
        }
        else {
            this.deleteAppButton.style.display = 'flex';
            this.componentsContainer.style.display = 'none';
        }
    }

    get data() {

        return {
            id: parseInt(this.appID.innerText.replace('APP ID: ', '')),
            name: this.appName.value,
            short_name: this.appShortName.value,
            url: this.appURL.value,
            state: this.appState.value,
            type: this.appType.value,
            admin: this.appAdmin.value,
            components: this.appComponents.value
        }
    }
}

let cpanelView = null;
let appEditView = null;
let modalWindow = null;

let currentView = null;

window.onload = async () => {

    Component.SPEED = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed').replace('s', '')) * 1000;

    cpanelView = new CPanelView(e => {

        switch (e.action) {
            case 'onappschange':
                let hideDelete = false;
                if (e.appData.action === 'newapp') {
                    hideDelete = true;
                }
                appEditView.resetView(e.appData, hideDelete);
                Animation.swapViews(cpanelView, appEditView);
                currentView = appEditView;
                break;
            case 'onuserschange':
                currentView = appEditView;
                break;
            default:
                break;
        }
    });
    await cpanelView.init();

    appEditView = new AppEditView(async e => {
        switch (e) {
            case 'cancel':
                Animation.swapViews(appEditView, cpanelView);
                break;
            case 'save':

                modalWindow.setData({
                    title: `Saving app`,
                    message: `Save ${appEditView.data.name}?`,
                    actions: 'cancel ok',
                    callback: async e => {
                        if (e === 'ok') {
                            const req = await fetch('/cpanel/saveapp', {
                                method: 'POST',
                                body: JSON.stringify(appEditView.data),
                                headers: { "Content-Type": "application/json" }
                            });
                            const res = await req.json();

                            let addButton = document.querySelector('.buttons-template').content.cloneNode(true).querySelector('icon-button');
                            addButton.setAttribute('label', 'new app');
                            res.data.push({
                                action: 'newapp',
                                buttonElem: addButton
                            });
                            cpanelView.updateApps(res.data);
                            if (res.success) {
                                Animation.swapViews(appEditView, cpanelView);
                                modalWindow.setData({
                                    message: res.message,
                                    actions: 'ok',
                                    callback: e => {
                                        modalWindow.hide();
                                    }
                                });
                            }
                        } else {
                            modalWindow.hide();
                        }
                    }
                });
                modalWindow.show(appEditView.view);

                break;
            case 'delete':
                modalWindow.setData({
                    title: `Deleting app`,
                    message: `Delete ${appEditView.data.name}?`,
                    actions: 'cancel ok',
                    callback: async e => {
                        if (e === 'ok') {
                            const req = await fetch('/cpanel/deleteapp', {
                                method: 'POST',
                                body: JSON.stringify({ appID: appEditView.data.id, name: appEditView.data.name }),
                                headers: { "Content-Type": "application/json" }
                            });
                            console.log('lwke')
                            const res = await req.json();
                            console.log(res)

                            let addButton = document.querySelector('.buttons-template').content.cloneNode(true).querySelector('icon-button');
                            addButton.setAttribute('label', 'new app');
                            res.data.push({
                                action: 'newapp',
                                buttonElem: addButton
                            });
                            cpanelView.updateApps(res.data);
                            if (res.success) {
                                Animation.swapViews(appEditView, cpanelView);
                                modalWindow.setData({
                                    message: res.message,
                                    actions: 'ok',
                                    callback: e => {
                                        modalWindow.hide();
                                    }
                                });
                            }
                        } else {
                            modalWindow.hide();
                        }
                    }
                });
                modalWindow.show(appEditView.view);
                break;
        }
    });

    modalWindow = document.querySelector('#modal-window');


    currentView = cpanelView;


    document.body.style.opacity = 1;
    document.querySelector('#cpanel-container').style.transform = 'scale(1)';
}

const onAppChange = data => {

}
const onUserChange = data => {
    console.log('user changed', data.detail)
}
