const values = {"statistics": true, "marketing": true};
const EXPIRATION_PERIOD = 6 * 30;


const now = new Date();
localStorage.setItem("last_set", now);

const expir_date = new Date(now.getDate() + EXPIRATION_PERIOD);
localStorage.setItem("expires", expir_date);

for(let key of Object.keys(values)) 
{
    localStorage.setItem(key, values[key]);
}
