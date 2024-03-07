// supported-attributes
// -> on-accept-script-path : string
// -> on-decline-script-path : string
// -> on-find-more-page-path : string

class lacb extends HTMLElement {

    static css_content = `
    *,
    *::after,
    *::before {
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    margin: 0;
    max-width: unset;
    max-height: unset;
    outline: 0px solid transparent;
    }

    :root {
    font-size: 20px;
    --bg-clr: #fff;
    --fg-clr: #000;
    }

    dialog {
        width: auto;
        height: auto;
        border: 0px solid transparent;
    }

    dialog::-webkit-backdrop {
        background: rgba(0, 0, 0, 0.25);
        -webkit-box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
        }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.25);
        -webkit-box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
    }

    #popup-container {
    display: -ms-grid;
    display: grid;
    place-items: center center;
    background-color: transparent;
    }

    .popup {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    width: 70%;
    max-width: 800px;

    background-color: #fff;
    color: #000;
    -webkit-box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

    border-radius: 16px;
    padding: 20px;

    -webkit-box-orient: vertical;

    -webkit-box-direction: normal;

        -ms-flex-flow: column;

            flex-flow: column;
    -webkit-box-align: stretch;
        -ms-flex-align: stretch;
            align-items: stretch;
    gap: 20px;

    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
    }

    .title {
    display: inline-block;
    vertical-align: middle;

    font-size: 1.25rem;
    font-weight: 500;

    margin: 0;
    }

    .content {
    font-weight: 300;
    margin: 0;
    }

    .buttons {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
        -ms-flex-flow: column wrap;
            flex-flow: column wrap;
    gap: 8px;

    max-width: 100%;
    -ms-flex-line-pack: center;
        align-content: center;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    }

    .btn {
    border-color: transparent;
    border-radius: 10px;

    white-space: nowrap;
    overflow: hidden;
    -o-text-overflow: ellipsis;
        text-overflow: ellipsis;

    text-align: center;
    text-decoration: none;

    outline: transparent;
    padding: 8px 32px;

    font-size: 1rem;
    width: 100%;

    background-color: #eee;
    color: #000;
    }

    .accept {
    background-color: rgb(78, 167, 78);
    color: #fff;
    }

    .btn:hover {
    cursor: pointer;
    }
    `;

    static html_content = `
    <dialog id="popup-container">
        <div class="popup">
            <span class="title">&#x1F36A; Consenti l'utilizzo di cookie?</span>
            <div class="content">
                Utilizziamo i cookie per personalizzare gli annunci e per analizzare il nostro traffico. 
                <br/>
                Usa il pulsante "<strong>Sì</strong>" per acconsentire e non visualizzare più questo popup.
            </div>
            <div class="buttons">
                <button class="btn accept" type="button" id="accept-button">Sì</button>
                <a class="btn" role="button" id="find-more-button" target="_blank" >Scopri di più</a>
                <button class="btn" type="button" id="decline-button" >No</button>
            </div>
        </div>
    </dialog>
    `;

    

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        

        this.should_appear = lacb.should_appear();
        if(!this.should_appear) {
            return;
        }
        
        this.shadowRoot.innerHTML = lacb.html_content;
        
        const style = document.createElement("style");
        this.shadowRoot.appendChild(style);
        style.innerHTML = lacb.css_content;

        this.dialog = this.shadowRoot.querySelector("#popup-container");
        this.accept_btn = this.shadowRoot.querySelector("#accept-button");
        this.decline_btn = this.shadowRoot.querySelector("#decline-button");
        this.findMore_btn = this.shadowRoot.querySelector("#find-more-button");

        
        this.acceptScript_path = null;
        this.declineScript_path = null;
    }

    connectedCallback() 
    {
        if(!this.should_appear) {
            return;
        }

        this.dialog.showModal();

        if(this.hasAttribute("on-accept-script-path")) this.acceptScript_path = this.getAttribute("on-accept-script-path");
        if(this.hasAttribute("on-decline-script-path")) this.declineScript_path = this.getAttribute("on-decline-script-path");
        if(this.hasAttribute("on-find-more-page-path")) this.findMore_btn.href = `${this.getAttribute("on-find-more-page-path")}?redir=${window.location.href}`;

        const dialog = this.dialog;
        const me = this;
        this.accept_btn.addEventListener("click", async function() {
            if(me.acceptScript_path) {
                await lacb.load_script(me.acceptScript_path);
            }
            dialog.close();
            dialog.style.display = "none";
        });

        this.decline_btn.addEventListener("click", async function() {
            if(me.declineScript_path) {
                await lacb.load_script(me.declineScript_path);
            }
            dialog.close();
            dialog.style.display = "none";
        });
    }

    static load_script(script_src) 
    {
        return new Promise(function(resolve) {

            fetch(script_src).then(function(doc) {
                return doc.text();  
            }).then(function(testo) {
                eval(testo);
                resolve(true);
            }).catch(function(error) {
                resolve(false);
            });
        });
    }

    static should_appear() {
        const cookies = lacb.get_cookies();

        const already_set = lacb.are_cookies_set(cookies);
        
        if(!already_set) {
            window.localStorage.clear();
        }

        return !already_set;
    }

    
    static are_cookies_set(cookies) {
        return (cookies["last_set"] && new Date(cookies['expires']).getTime() < new Date().getTime());
    }
    
    
    
    static get_cookies() 
    {
        const expires = localStorage.getItem("expires") || null;
        const last_set = localStorage.getItem("last_set") || null;
        const statistics = localStorage.getItem("statistics") === 'true';
        const marketing = localStorage.getItem("marketing") === 'true';
    
        return {expires, last_set, statistics, marketing};
    }

    
}

document.currentScript.onload = function() { 
    if(!customElements.get("lorenzoarlo-cookiebutton"))
        customElements.define("lorenzoarlo-cookiebutton", lacb); console.log("Element defined!"); 
};

if(!customElements.get("lorenzoarlo-cookiebutton")) {
    customElements.define("lorenzoarlo-cookiebutton", lacb);
}