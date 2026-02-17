const SIDES = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d4s: 4, 
};

const DIES = {
    4: 'd4',
    6: 'd6',
    8: 'd8',
    10: 'd10',
    12: 'd12',
    20: 'd20'
};


const POSITION = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    6: 'sixth',
    7: 'seventh',
    8: 'eighth',
    9: 'ninth',
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
} 

function wipeDict(){
    rollDict = {};
    initiativeroll = 0;
    rollDict['message'] = '';
}

let rollDict = {};
let initiativeroll = 0;

function rollDie(die, critTimes, totalRunning, newRoll = false) {

    if (newRoll){ wipeDict();}
    

    critTimes = critTimes+=1;


    let rolledValue = getRandomInt(SIDES[die]);

    if(die === 'd4s') {
        rollDict['d4s'] = rolledValue;
        return rollDict;
    }

    else{

        totalRunning += rolledValue;

        rollDict['total'] = totalRunning;

        
        rollDict['message'] += '\n' + POSITION[critTimes] + ' roll: ' + rolledValue;

        rollDict[POSITION[critTimes]] = rolledValue;

        if(SIDES[die] > 9) {

            
            if (rolledValue === 6 || rolledValue === SIDES[die]){

                console.log("crit!")

                rollDie(DIES[rolledValue],critTimes,totalRunning)
                return rollDict;

            }else{
                return rollDict;
            }

        }else{

            if (rolledValue === SIDES[die]){

                rollDict[POSITION['exploded']] = true;

                rollDie(DIES[rolledValue],critTimes,totalRunning)
                return rollDict;
            }else{
                return rollDict;
            }
        }
           
    }
    
   


}


function rollInitiative(die,critTimes,newRoll = false){

    if (newRoll){ wipeDict();}


    critTimes = critTimes+=1;


    let rolledValue = getRandomInt(die);




    initiativeroll += rolledValue;
    rollDict['message'] += '\n' + POSITION[critTimes] + ' roll: ' + rolledValue;
    rollDict['total'] = rollDict['total'] == null ? initiativeroll : rollDict['total'] + rolledValue;


    if(rolledValue === die){
        rollInitiative(rolledValue,critTimes);
    }else{
        return rollDict;
    }

    return rollDict;
}

module.exports = { rollDie, Sides: SIDES, getRandomInt,rollInitiative };