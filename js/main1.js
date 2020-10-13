let firstHandle , secondHandle ;
const button1 = document.querySelector(".btn1");
const button2 = document.querySelector(".btn2");
const button3 = document.querySelector(".btn3");
const col3 = document.querySelector(".column3");
const col4 = document.querySelector(".column4");
const firstCFHandle = document.getElementById("firstCFHandle");
const secondCFHandle = document.getElementById("secondCFHandle");
const loadingMessage = document.querySelector(".loading-message");
const loadingDiv = document.querySelector(".loading");
const problemCntMessage = document.querySelector("#problemCntMessage");
const swapButton = document.querySelector(".btn-swap");
const ratingsDropDown = document.querySelector(`select[name = "selectRating"]`);

// const selectTags = document.querySelector(`select[name = "selectTags"]`);
const endpointUserInfo = "https://codeforces.com/api/user.info?handles=";
const endpointUserStats = "https://codeforces.com/api/user.status?handle=";
let pre = "https://codeforces.com/problemset/problem/";
let firstUserProblems = [], secondUserContests = [], v = [], users = new Set(), vRatingFilter = [];
let st1 = new Set(), st2 = new Set();
const nav = document.querySelector('#main');
let topOfNav = nav.offsetTop;
let g1 = false, g2 = false;
let availableTags = new Set();
let ratingSelected = "All";

function toHHMMSS(sec_num)
{
    let date = new Date(0);//0=>set to epoch
    date.setUTCSeconds(sec_num);
    return date;
}

function sortByRating(a,b)
{
    if(a.rating<b.rating) return -1;
    return 1;
}

function sortByDate(a,b)
{
    if(a.date>b.date) return -1;
    return 1;
}

function updateUserCache()
{
    localStorage.setItem("users",JSON.stringify(Array.from(users).map((it)=>{return it;} )));
}

function displayUpdate(arr)
{
    tbody = document.querySelector(`tbody`);
    tbody.innerHTML = "";
    let cnt = 1;
    arr.forEach(
    (it)=>
    {

        tr = document.createElement(`tr`);
        tbody.appendChild(tr);
        const name = it[`name`];
        const link = it['link'];
        const tags = it[`tags`];
        const rating = it[`rating`]
        const date = toHHMMSS(it[`date`]);
        const verdict = it['verdict'];
        anchorTag = document.createElement(`a`);
        anchorTag.setAttribute(`href`,link);
        anchorTag.setAttribute(`target`,`_blank`)
        anchorTag.textContent = name;

        const p = document.createElement("p");
        p.textContent = String(cnt);
        
        td0 = document.createElement(`td`);
        td0.appendChild(p);
        tr.appendChild(td0);

        td = document.createElement(`td`);
        td.appendChild(anchorTag);
        tr.appendChild(td);

        td1 = document.createElement(`td`);
        td1.textContent = tags;
        tr.appendChild(td1);

        td2 = document.createElement(`td`);
        td2.textContent = rating;
        tr.appendChild(td2);

        td3 = document.createElement(`td`);
        td3.textContent = date;
        tr.appendChild(td3);

        cnt++;
    }
    )
}



function timeout(ms, promise) 
{
    return new Promise(
    function(resolve, reject) 
    {
      const refresh = setTimeout
      (
        function() 
        {
            reject("timeout")
        }, ms
      );

      promise.then(
        (response)=>
        {
            // console.log("response:",response);
            clearTimeout(refresh);
            // resolve(response.json());
            return response.json();
        }
      )
      .catch(
        (err)=>
        {
            // console.log({err});
            clearTimeout(refresh);
            // reject(err);
            return false;
        }
    );
    }
    );
}

async function fetchProblems(name,arr)
{
    let response;
    try
    {
        response = await fetch(endpointUserStats+String(name));
        // console.log("response:",response);
    }
    catch(err)
    {
        // console.log("error:",err);
        loadingMessage.textContent = "Could not fetch details, please check your internet connection and try again";
        return false;
    }
    // if(response)
    let temp = await response.json();
    // let temp = response;
    // console.log("hi");
    let obj = {};
    temp.result.forEach(
        (it)=>
        {   
            obj = {};
            obj.link = pre + it.contestId + "/" + it.problem.index;
            obj.name = it.problem.name;
            obj.verdict = it.verdict;
            obj.tags = it.problem.tags;
            obj.rating = it.problem.rating;
            obj.date = it.creationTimeSeconds;
            // console.log(typeof obj.rating);
            if(obj.verdict === "OK" && typeof obj.rating === typeof Number(1) ) 
            {
                arr.push(obj);
                obj.tags.forEach(
                    (currTag)=>
                    {
                        availableTags.add(currTag);
                    }
                );
            }
        }
    );
    return true;       
   
}

function fixNav() 
{
    if (window.scrollY >= topOfNav) 
    {
        document.body.style.paddingTop = nav.offsetHeight + 'px';
        document.body.classList.add('fixed-nav');
    } 
    else 
    {
        document.body.classList.remove('fixed-nav');
        document.body.style.paddingTop = 0;
    }
}

function fixNavTop() 
{
    if (window.scrollY >= 100+ topOfNav) 
    {
        // document.body.style.paddingTop = nav.offsetHeight + 'px';
        document.body.classList.add('cool-nav');
    } 
    else 
    {
        document.body.classList.remove('cool-nav');
        // document.body.style.paddingTop = 0;
    }
}

function checkHandle(name)
{
    // console.log("name:",name);
    if(name===undefined ) return false;
    if(users.has(name))
    {
        return true;
    }
    const response = fetch(endpointUserInfo+(name));
    return response
    .then(
        (temp)=>
        {
            // console.log("temp",temp.ok);
            // console.log("hello");
            if(temp.ok) return true;
            return false;
        },
        (err)=>
        {
            return false;
        }
    );
}

async function changaName(e)
{
    e.preventDefault();
    if(e.target.classList.contains("btn1"))
    {
        // console.log("button1");
        firstHandle = firstCFHandle.value;
        g1 = await checkHandle(firstHandle);
        if(!g1)
        {
            alert("Invalid handle, Try again");
        }
        else
        {
            users.add(firstHandle);
            updateUserCache();
        }
    }
    else if(e.target.classList.contains("btn2"))
    {
        // console.log("button2");
        secondHandle = secondCFHandle.value;
        g2 = await checkHandle(secondHandle);
        if(!g2)
        {
            alert("Invalid handle, Try again");
        }
        else
        {
            users.add(secondHandle);
            updateUserCache();
        }
    }
    
}

async function runEventButton3(e)
{
    e.preventDefault();
    // console.log(e);
    // let flag1 = await checkHandle(firstHandle);
    // let flag2 = await checkHandle(secondHandle);
    let flag = g1&&g2;
    // console.log({flag});
    loadingMessage.textContent = "Please wait while the list is being updated...";
    loadingDiv.style.display = "block";

    if(flag)
    {
        // console.log(firstHandle,secondHandle);
        firstUserProblems = [];
        secondUserContests = [];
        let temp1 = await fetchProblems(firstHandle,firstUserProblems);
        let temp2 = await fetchProblems(secondHandle,secondUserContests);
        if(!temp1 || !temp2)
        {
            loadingMessage.textContent = "Could not fetch details, please check your internet connection and try again";
            return;
        }
        // console.log("hehehe");
        document.body.style.paddingTop += loadingDiv.getBoundingClientRect().height;
        loadingDiv.style.display = "none";
        // document.body.style.paddingTop = 0;

        st1.clear();st2.clear();
        firstUserProblems.forEach(
            (it)=>
            {
                st1.add(it.link);
            }
        );
        secondUserContests.sort(sortByDate);
        v = secondUserContests.filter(
            (it)=>
            {
                if(!st2.has(it.link))
                {
                    if(!st1.has(it.link)) 
                    {
                        st1.add(it.link);
                        return it;
                    }
                    else
                    {
                        if(it.verdict!=="OK")
                        {
                            st1.add(it.link);
                            return it;
                        }
                    }
                }
                
            }

        );
        const len = v.length;
        problemCntMessage.innerHTML = `Total ${len} number of problems are done successfully by <em><strong>${secondHandle}</strong></em>  which are not done by 
        <em><strong>${firstHandle}</strong></em>`;
        // console.log(v);
        ratingSelected = "All";
        let rating  = -1, greaterFlag = false;
        for(let w of Array.from(ratingsDropDown.options))
        {
            if(w.selected)
            {
                ratingSelected = w.value;
                if(w.value[0]>='0' && w.value[0]<='9')
                {
                    rating = parseInt(w.value);
                }
                else if(w.value==="All")
                {
                    rating = -1;
                }
                else
                {
                    rating = parseInt(w.value.slice(1));
                    greaterFlag = true;
                }
                break;
            }
        }
        // console.log({rating,greaterFlag});
        vRatingFilter = v.filter(
            (it)=>
            {
                if(rating===-1)
                {
                    return it;
                }
                if(greaterFlag)
                {
                    if(it.rating>=rating) return it;
                }
                else
                {
                    if(it.rating === rating) return it;
                }
            }
        );
        displayUpdate(vRatingFilter);
    }
    else
    {
        // console.log("here");
        alert("First or Second handle is invalid");
        document.body.style.paddingTop += loadingDiv.getBoundingClientRect().height;
        loadingDiv.style.display = "none";
        
    }
}

const userCache = JSON.parse(localStorage.getItem("users") )||[];
userCache.forEach(
    (it)=>
    {
        users.add(it);
    }
);

document.body.style.paddingTop += loadingDiv.getBoundingClientRect().height;
loadingDiv.style.display = "none";
document.body.style.paddingTop = 0;

window.addEventListener('scroll', fixNav);
window.addEventListener('scroll', fixNavTop);

let ratingOrder = 1, dateOrder = 1;
col3.addEventListener("click",
(e)=>
{
    if(ratingSelected!=="All") return;
    ratingOrder = !ratingOrder;
    vRatingFilter.sort(sortByRating);
    if(!ratingOrder) vRatingFilter.reverse();
    displayUpdate(vRatingFilter);
}
);

col4.addEventListener("click",
(e)=>
{
    dateOrder = !dateOrder;
    vRatingFilter.sort(sortByDate);
    if(!dateOrder) vRatingFilter.reverse();
    displayUpdate(vRatingFilter);
}
);

button1.addEventListener("click",changaName);
button2.addEventListener("click",changaName);
button3.addEventListener("click",runEventButton3);
swapButton.addEventListener("click",
(e)=>
{
    e.preventDefault();
    // console.log(e);
    if(firstHandle!==undefined && secondHandle!==undefined)
    {
        let temp = firstHandle;
        firstHandle = secondHandle;
        secondHandle = temp;

        firstCFHandle.value = firstHandle;
        secondCFHandle.value = secondHandle; 
    }
}
);

ratingsDropDown.addEventListener("input",
()=>
{
        ratingSelected = "All";
        let rating  = -1, greaterFlag = false;
        for(let w of Array.from(ratingsDropDown.options))
        {
            if(w.selected)
            {
                ratingSelected = w.value;
                if(w.value[0]>='0' && w.value[0]<='9')
                {
                    rating = parseInt(w.value);
                }
                else if(w.value==="All")
                {
                    rating = -1;
                }
                else
                {
                    rating = parseInt(w.value.slice(1));
                    greaterFlag = true;
                }
                break;
            }
        }
        // console.log({rating,greaterFlag});
        vRatingFilter = v.filter(
            (it)=>
            {
                if(rating===-1)
                {
                    return it;
                }
                if(greaterFlag)
                {
                    if(it.rating>=rating) return it;
                }
                else
                {
                    if(it.rating === rating) return it;
                }
            }
        );
        displayUpdate(vRatingFilter);
}
);