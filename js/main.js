let div3ContestList = [], div2ContestList = [], div1ContestList = [], eduContestList = [], globalContestList = [], otherContestList = [], currList = []
, upcomingContests = [] ;
let div3Set = new Set(), div2Set = new Set(), div1Set = new Set(), eduSet = new Set(), globalSet = new Set(), otherSet = new Set(), upcomingSet = new Set();
const endpoint = "https://codeforces.com/api/contest.list";
const pageTitle = document.getElementsByTagName(`title`)[0];
const dropDown = document.querySelector(`select[name = "contestType"]`);
let pre = "https://codeforces.com/contests/";
const dateColHeader = document.querySelector(".column2");
const loadingMessage = document.querySelector(".loading-message");


function toHHMMSS(sec_num)
{
    let date = new Date(0);//0=>set to epoch
    date.setUTCSeconds(sec_num);
    return date;
}

function sortByDate(a,b)
{
    if(a.date<b.date) return -1;
    return 1;
}

function cmp(obj1,obj2)
{
    if((obj1.date) - (obj2.date)>0) return -1;
    return 1;
}

function sortAllContests()
{
    div3ContestList.sort(cmp);
    div2ContestList.sort(cmp);
    div1ContestList.sort(cmp);
    eduContestList.sort(cmp);
    globalContestList.sort(cmp);
    upcomingContests.sort(sortByDate);
}

function giveUpcomingContests(arr)
{
    const currTime = ((Date.now()) );//in seconds
    
    return arr.filter(
        (it)=>
        {

            if(1000*(it.date)>currTime && !upcomingSet.has(it.id))
            {
                upcomingSet.add(it.id);
                return it;
            }
        }
    );
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
        const date = toHHMMSS(it[`date`]);
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
        td1.textContent = date;
        tr.appendChild(td1);

        cnt++;
    }
    )
}

function updateLocalStorage(clearFlag = false)
{
    if(clearFlag)
    {
        localStorage.clear();
        return;
    }
    sortAllContests();
    localStorage.setItem("div3",JSON.stringify((div3ContestList)));
    localStorage.setItem("div2",JSON.stringify((div2ContestList)));
    localStorage.setItem("div1",JSON.stringify((div1ContestList)));
    localStorage.setItem("edu",JSON.stringify((eduContestList)));
    localStorage.setItem("global",JSON.stringify((globalContestList)));
    localStorage.setItem("other",JSON.stringify((otherContestList)));
    localStorage.setItem("upcoming",JSON.stringify(upcomingContests));
}

function fetchContestLists()
{
    div3ContestList = JSON.parse(localStorage.getItem("div3"))||[];
    div2ContestList = JSON.parse(localStorage.getItem("div2"))||[];
    div1ContestList = JSON.parse(localStorage.getItem("div1"))||[];
    eduContestList = JSON.parse(localStorage.getItem("edu"))||[];
    globalContestList = JSON.parse(localStorage.getItem("global"))||[];
    otherContestList = JSON.parse(localStorage.getItem("other"))||[];

    upcomingContests =  upcomingContests.concat(giveUpcomingContests(div3ContestList));
    upcomingContests =  upcomingContests.concat(giveUpcomingContests(div2ContestList));
    upcomingContests =  upcomingContests.concat(giveUpcomingContests(div1ContestList));
    upcomingContests =  upcomingContests.concat(giveUpcomingContests(eduContestList));
    upcomingContests =  upcomingContests.concat(giveUpcomingContests(globalContestList));
    upcomingContests =  upcomingContests.concat(giveUpcomingContests(otherContestList));

    sortAllContests();

    for(let w of div3ContestList)
    {
        div3Set.add(w.id);
    }

    for(let w of div2ContestList)
    {
        div2Set.add(w.id);
    }

    for(let w of div1ContestList)
    {
        div1Set.add(w.id);
    }

    for(let w of eduContestList)
    {
        eduSet.add(w.id);
    }
    
    for(let w of globalContestList)
    {
        globalSet.add(w.id);
    }

    for(let w of otherContestList)
    {
        otherSet.add(w.id);
    }

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
            reject(new Error("timeout"))
        }, ms
      );

      promise.then(
        (response)=>
        {
            // console.log("response:",response);
            clearTimeout(refresh);
            resolve(response.json());
            
        }
      )
      .catch(
        (err)=>
        {
            // console.log({err});
            clearTimeout(refresh);
            reject(err);
        }
    );
    }
    );
}

function makeAsyncRequestToCFAPI()
{
    // fetch(endpoint)
    // .then(
    // (response)=>
    // {
    //     // console.log("response:",response);
    //     return response.json();
    // }
    // )
    timeout(10*1000,fetch(endpoint))
    .then(
    (temp)=>
    {
        // console.log("hehehe:",eduContestList);

        // console.log({temp});
        // console.log("temp:",temp.result);
        // console.log(typeof temp.result);
        const currTime = ((Date.now()) );//in seconds
        temp.result.forEach(
            (it)=>
            {
                const currContestObj = {id:it.id,name:it.name,date:(it.startTimeSeconds),link:pre+String(it.id)};
                let g = 0;
                if(it.name.indexOf("Div. 3")!=-1 )
                {
                    if(!div3Set.has(it.id))
                    {
                        div3ContestList.push(currContestObj);
                        div3Set.add(it.id);

                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                    
                    g = 1;
                }

                if(it.name.indexOf("Div. 1")!=-1)
                {
                    if(!div1Set.has(it.id))
                    {
                        div1ContestList.push(currContestObj);
                        div1Set.add(it.id);
                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                    g = 1;
                }

                if(it.name.indexOf("Div. 2")!=-1)
                {
                    if(!div2Set.has(it.id))
                    {
                        div2ContestList.push(currContestObj);
                        div2Set.add(it.id);
                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                    g = 1;
                }

                if(it.name.indexOf("Educational")!=-1)
                {
                    if(!eduSet.has(it.id))
                    {
                        eduContestList.push(currContestObj);
                        eduSet.add(it.id);
                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                    g = 1;
                }

                if(it.name.indexOf("Global Round")!=-1)
                {
                    if(!globalSet.has(it.id))
                    {
                        globalContestList.push(currContestObj);
                        globalSet.add(it.id);
                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                    g = 1;
                }
                if(!g)
                {
                    if(!otherSet.has(it.id))
                    {
                        otherContestList.push(currContestObj);
                        otherSet.add(it.id);
                        if(!upcomingSet.has(it.id) && 1000*(it.date)>currTime)
                        {
                            upcomingContests.push(currContestObj)
                            upcomingSet.add(it.id);
                        }
                    }
                }
            }

        );
        updateLocalStorage();
        fetchContestLists();
    }

    )
    .catch(
        (err)=>
        {
            // console.log("Error message:",err);
            // alert(`Failed to fetch from CF API, will show results which are in website cache`);
            loadingMessage.style.display = "block";
            fetchContestLists();

        }
    );
}

dropDown.addEventListener("input",
    (e)=>
    {
        let divName = "";
        for(let w of Array.from(dropDown.options))
        {
            // console.log(w,w.selected);
            if(w.selected)
            {
                // console.log(w.value);
                divName = w.value;
                pageTitle.textContent = divName;
                break;
            }
        }
        
        
        if(divName === "Divison 3")
        {
            displayUpdate(div3ContestList);
            currList = div3ContestList;
        }
        else if(divName === "Divison 2")
        {
            displayUpdate(div2ContestList);
            currList = div2ContestList;
        }
        else if(divName === "Divison 1")
        {
            displayUpdate(div1ContestList);
            currList = div1ContestList;
        }
        else if(divName === "Educational Rounds")
        {
            displayUpdate(eduContestList);
            currList = eduContestList;
        }
        else if(divName === "Global Rounds")
        {
            displayUpdate(globalContestList);
            currList = globalContestList;
        }
        else if(divName === "Other Contests")
        {
            displayUpdate(otherContestList);
            currList = otherContestList;
        }
        else if(divName === "Upcoming Contests")
        {
            // upcomingContests.reverse();
            displayUpdate(upcomingContests);
            currList = upcomingContests;
        }
        else
        {
            currList = [];
            tbody = document.querySelector(`tbody`);
            tbody.innerHTML = "";
        }
    }
    );

loadingMessage.style.display = "none";
// fetchContestLists();

dateColHeader.addEventListener("click",
(e)=>
{
    // console.log(currList);
    currList.reverse();
    displayUpdate(currList);
}
);

const nav = document.querySelector('#main');
let topOfNav = nav.offsetTop;

function fixNav() 
{
    if (window.scrollY >=topOfNav) 
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

window.addEventListener('scroll', fixNav);
window.addEventListener('scroll', fixNavTop);




