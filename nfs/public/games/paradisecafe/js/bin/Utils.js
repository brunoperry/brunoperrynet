class Utils {

    static getRandomItem(data) {
        return data[Math.floor(Math.random() * data.length)];
    }
    static getRandomTrueFalse() {
        return Utils.getRandomItem([
            true, false, false, true, false, true, true, false, true, false, false, true, false, true, false, true, true, false
        ])
    }

    static clearItemsFrom(data, target) {

        let arr = [];
        for (let i = 0; i < data.length; i++) {
            const elem = data[i];
            if (elem.name.includes(target)) continue;
            arr.push(elem);
        }
        return arr;
    }

    static shuffle(arr) {
        arr.map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1]);
    };
}