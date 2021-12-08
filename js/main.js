class App
{
    constructor() {
        this.encrypter = new Encrypter();
        this.fileIO = new FileIO();

        this.fileIO.onFileLoad = data => { 
            const matchingItems = this.getMatchingItems(data);
            this.ui.showResult(matchingItems);
        }
    }

    getItems() 
    {
        let items = []
        this.ui.inputs.forEach(input => {
            const value = input.value;
            if(value != "") 
            {
                items.push(input.value);
            }
        });

        return items;
    }

    saveHashed() {
        const hashedItems = this.encrypter.hashItems(this.getItems());
        this.fileIO.saveAs(hashedItems, `items-${Date.now()}.txt`);
    }

    loadFile() {
        this.fileIO.open();
    }

    getMatchingItems(data) {
        const hashes = data.split(',');
        const items = this.getItems();
        let matching = []

        items.forEach(item => {
            const hashed = this.encrypter.hash(item.toLowerCase());
            hashes.forEach(hash => {
                if(hash === hashed) {
                    matching.push(item);
                }
            });
        });

        return matching;
    }
} 

class UI {
    constructor(app) {
        this.app = app
        this.app.ui = this

        this.itemsDiv = document.getElementById("items");
        this.controllsDiv = document.getElementById("controlls");
        this.resultsDiv = document.getElementById("result");

        this.inputs = []

        this.createUI()
    }

    createUI() {
        for(let i = 0; i < 10; i++) {
            this.addInput();
        }

        this.addAddInputButton();
        this.addSaveButton();
        this.addLoadButton();

    }

    addInput() 
    {
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("field");

        const input = document.createElement("input");
        input.id = `item-${this.inputs.length}`;
        input.placeholder = `Item #${this.inputs.length + 1}`
        containerDiv.appendChild(input);

        const line = document.createElement("div");
        line.classList.add("line");
        containerDiv.appendChild(line);

        this.itemsDiv.appendChild(containerDiv);

        this.inputs.push(input);
    }

    addAddInputButton() {
        const button = document.createElement("button");
        button.innerHTML = "Add Item"
        button.onclick = this.addInput.bind(this);
        this.controllsDiv.appendChild(button);
    }

    addSaveButton() {
        const button = document.createElement("button");
        button.innerHTML = "Save Encrypted"
        button.onclick = this.app.saveHashed.bind(this.app);
        this.controllsDiv.appendChild(button);
    }

    addLoadButton() {
        const button = document.createElement("button");
        button.innerHTML = "Load & Check"
        button.onclick = this.app.loadFile.bind(this.app);
        this.controllsDiv.appendChild(button);
    }

    showResult(items) {
        this.resultsDiv.innerHTML = "";
        const p = document.createElement("p");

        if(items.length > 0) 
        {   
            const ul = document.createElement("ul");
            items.forEach(item => {
                const li = document.createElement("li");
                li.innerText = item;
                ul.appendChild(li);
            })

            p.innerText = `There ${items.length === 1 ? `is` : `are`} ${items.length} matching item${items.length === 1 ? `` : `s`}:`;
            p.classList.add('green-text')
            p.appendChild(ul);

        } 
        else 
        {
            p.innerText = 'No matching items';
        }

        this.resultsDiv.appendChild(p);
    }
}

class Encrypter 
{
    hash(text) { 
        text = text.toLowerCase();
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          const char = text.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash &= hash;
        }
        return new Uint32Array([hash])[0].toString(36);
    };

    hashItems(items) 
    {
        let hashed = []
        items.forEach(item => {
            hashed.push(this.hash(item));
        });

        return hashed;
    }
}

class FileIO {
    constructor() {
        this.reader = new FileReader();

        this.fileInput = document.createElement("input");
        this.fileInput.setAttribute("type","file");

        this.onFileLoad = new Event('onfileload', { bubbles: true, cancelable: true, composed: false });

        this.reader.onload = (e) => {
            this.onFileLoad(e.target.result);
            this.fileInput.value = '';
        };

        this.fileInput.addEventListener('change', this.readFile.bind(this), false);
    }

    saveAs(data, filename) {
        const pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        pom.setAttribute('download', filename);
    
        if (document.createEvent) {
            const event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }

    open() {
        this.fileInput.click();
    }

    readFile(e) {
        var file = e.target.files[0];

        if (!file) 
          return;

        this.reader.readAsText(file);
    }
}

const app = new App();
const ui = new UI(app);