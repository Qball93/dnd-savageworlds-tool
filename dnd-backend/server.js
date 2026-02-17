require('./src/db.js')
const { rollDie, Sides, getRandomInt, rollInitiative } = require('./utils/dice');

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const clientDistPath = path.join(
  __dirname,
  '..',          // go up from dnd-backend
  'dnd-frontend',
  'dist'
);

app.use(express.static(clientDistPath));

// Optional example API route (keeps working)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});



app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});




const io = new Server(server, {
  cors: {
    origin: port, // dev frontend
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // 1) Join a session/room
  socket.on('joinSession', (sessionId) => {
    if (!sessionId) return;
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
    socket.emit('joinedSession', sessionId);
  });

  // 2) Test event: server appends text and broadcasts to the session
  socket.on('testSession', ({ sessionId, name }) => {
    if (!sessionId) return;

    const payload = {
      sessionId,
      message: `Server says: Hello from session "${sessionId}"`,
      from: name,
      timestamp: new Date().toISOString(),
    };

    // Send to everyone in this session
    io.to(sessionId).emit('sessionUpdate', payload);
    console.log('Broadcasted sessionUpdate:', payload);
  });

  socket.on('sendMessage', ({sessionId, message, name }) => {



    if (!sessionId || !message) return;


    const payload = {
      sessionId,
      message: message,
      from: name,
      timestamp: new Date().toISOString(),
    }

    io.to(sessionId).emit('sessionUpdate', payload);
  });

  socket.on('sendRoll', ({sessionId, name, modifierChunk, dies}) => {

    const dict = {

    }

    console.log(modifierChunk)
    let max = 0;
    let message = 'Highest Roll: |MAX| \n\nRoll Data: \n';
    let d4plus = false;
    let d4val = 0;
    let first = true;



    if(modifierChunk.extraD4){
      d4plus = true;
      d4val = getRandomInt(4);
    }


    dies.forEach((value, index) => {

      
      dict[index] = rollDie(value,0, 0,true);
      let curentTotal = dict[index]['total'];


      if(dict[index]['total'] > max){  
        max = dict[index]['total'];
      }


      if(first){

        console.log(dict[index]['message']);

        message += `\nPRIMARY DIE:  (${[value]}!) ${dict[index]['message']}`;

        console.log(dict)



      }else{  
        message += `\nEXTRA DIE:  (${[value]}!) ${dict[index]['message']} `;
      }



      message += ` = ${curentTotal} \n`;
      

      if(first)
      {
        first = false;
        if(modifierChunk.wildDie){
          let curentTotal = 0;
          dict['99'] = rollDie('d6',0, 0,true);
          message += `\nWILD DIE:  (d6!) ${dict['99']['message']} `;
          curentTotal += dict['99']['total'];

          message += ` = ${curentTotal} \n`;
              
        }

      }
    });


    absMax =  max + d4val;
    maxString =  max.toString() + ' + (d4) ' + d4val.toString(); 

    if(modifierChunk.shaken){
      absMax -= 2;
      maxString = maxString + ' - 2 (shaken)';
    } 

    if(modifierChunk.wounded > 0){
      absMax -= modifierChunk.wounded;
      maxString = maxString + ` - ${modifierChunk.wounded} (wounded)`;

    } 

    if(parseInt(modifierChunk.modifier) !=  0){
      absMax += parseInt(modifierChunk.modifier);
      if(modifierChunk.modifier > 0){
        maxString = maxString + ` + ${parseInt(modifierChunk.modifier)} (modifier)`;
      }else{
        maxString = maxString + ` - ${Math.abs(parseInt(modifierChunk.modifier))} (modifier)`;
      }

    }

    maxString = maxString + ' = ' + absMax.toString();

    message = message.replace('|MAX|', maxString);

    console.log(absMax);
    console.log(maxString);

    const payload = {
      sessionId,
      message: message,
      from: name,
      timestamp: new Date().toISOString(),
    }
      
      io.to(sessionId).emit('sessionUpdate', payload);
      
    

  });
  

  socket.on('sendInitiative', ({sessionId, name}) => {


    if (!sessionId) return;


    let initiativeResult = rollInitiative(12,0,true);


    console.log(initiativeResult);

    message = `Initiative Roll: ${initiativeResult.total} \n ${initiativeResult.message}`;

    

    const payload = {
      sessionId,
      message: message,
      from: name,
      timestamp: new Date().toISOString(),
    }

    io.to(sessionId).emit('sessionUpdate', payload);


  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});