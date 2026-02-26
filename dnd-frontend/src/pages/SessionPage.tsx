// src/pages/SessionPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { socket } from '../socket';
import type { SessionUpdatePayload } from '../socket';
import type { Die } from './../types/types';


const SessionPage: React.FC = () => {
  const params = useParams();
  const sessionId = useMemo(() => decodeURIComponent(params.sessionId ?? ''), [params.sessionId]);
  const [name, setName] = useState(() => localStorage.getItem('chat_name') ?? '');


  const [joined, setJoined] = useState(false);
  const [updates, setUpdates] = useState<SessionUpdatePayload[]>([]);
  const [connected, setConnected] = useState(false);
  const [messageValue, setMessageValue] = useState('');
  const clearDice = () => setSelectedDice([]);

  const [prevDies, setPrevDies] = useState<Die[]>([]);



  const [selectedDice, setSelectedDice] = useState<Die[]>([]);

  const wounds = ['0','1','2','3'];
  const [woundLevels, setWoundLevels] = useState(wounds[0]);
  const [modifierValues, setModifierValues] = useState("0");

  const shaken = false;
  const [shake, setShake] = useState(shaken);

  const useWildDie = false;
  const [wildDie, setWildDie] = useState(useWildDie);

  const useExtraD4 = false;
  const [extraD4, setExtraD4] = useState(useExtraD4);




 const removeDieAt = (indexToRemove: number) => {
  setSelectedDice((prev) => prev.filter((_, i) => i !== indexToRemove));
};

  // socket listeners
  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setJoined(false);
      console.log('Disconnected');
    });

    socket.on('joinedSession', (id: string) => {
      console.log('Joined session', id);
      // only mark joined if it matches the URL session
      if (id === sessionId) setJoined(true);
    });

    socket.on('sessionUpdate', (payload: SessionUpdatePayload) => {
      // filter: only show updates for the session in the URL
      if (payload.sessionId !== sessionId) return;

      console.log('Received sessionUpdate:', payload);
      setUpdates((prev) => [payload, ...prev]);
    });


    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('joinedSession');
      socket.off('sessionUpdate');
    };
  }, [sessionId]);

  // auto-join whenever sessionId or connection changes
  useEffect(() => {
    setJoined(false);
    setUpdates([]);

    if (!sessionId) return;
    if (!socket.connected) return;

    socket.emit('joinSession', sessionId);
  }, [sessionId, connected]);


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    localStorage.setItem('chat_name', e.target.value);
  }

  const handleSend = () => {
    const msg = messageValue.trim();
    if (!sessionId || !joined) return;

    if(!name) setName("Anonymouse");

    socket.emit('sendMessage', {
      name: name,
      sessionId,
      message: msg
    });

    setMessageValue('');

  }

  const handleModifier = (e: React.ChangeEvent<HTMLInputElement>) => {


    const next = e.target.value;
    if (/^-?\d*$/.test(next)) {setModifierValues(next);}
  }

  const handleRoll = () => {
    if (selectedDice.length === 0) return;

    setPrevDies(selectedDice);

   
    let mChunk = handleMChunk();

    if(!name) setName("Anonymouse");

    socket.emit('sendRoll', {
      name: name,
      sessionId,
      dies: selectedDice,
      modifierChunk: mChunk
    });

    clearDice();

  }

  const handleReRoll = () => {

    console.log("Re-rolling with previous dies:", prevDies);
    if (prevDies.length === 0) return;

  
    let mChunk = handleMChunk();

    if(!name) setName("Anonymouse");

    socket.emit('sendRoll', {
      name: name,
      sessionId,
      dies: prevDies,
      modifierChunk: mChunk
    });

    clearDice();

  }
  
  const handleInitiative = () => {

    console.log("Rolling Initiative with d12");

    if(!name) setName("Anonymouse");

    socket.emit('sendInitiative', {
      name: name,
      sessionId
    });


  }

  const handleAddDie = (e: React.MouseEvent<HTMLButtonElement>) => {


    const id = e.currentTarget.id;

    const dieMap: Record<string, Die> = {
    'd4-button': 'd4',
    'd6-button': 'd6',
    'd8-button': 'd8',
    'd10-button': 'd10',
    'd12-button': 'd12',
    'd20-button': 'd20',
    'd4s-button' : 'd4s'
    };

    var dieId = dieMap[id];


    setSelectedDice((prev) => [...prev, dieId]);
  }

  const handleMChunk = () => {


    let myChunk =  {
      shaken: shake,
      wounded: woundLevels,
      modifier: modifierValues,
      wildDie: wildDie,
      extraD4: extraD4
    }
    return myChunk;
  }



  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Session: <span style={{ opacity: 0.9 }}>{sessionId}</span></h1>
        <Link to="/join" style={{ color: '#c9d4ff' }}>Change session</Link>
      </div>

      <p style={{ marginTop: '0.75rem' }}>
        Socket status:{' '}
        <strong>{connected ? '🟢 Connected!!!' : '🔴 Disconnected!!!!'}</strong>
        {'  '}|{'  '}
        Room:{' '}
        <strong>{joined ? '✅ Joined' : '⏳ Not joined'}</strong>
      </p>

      <div className='modifier-row row-3'>
      <div className='field field-inline'>
        <label> Send a message</label>
        <input
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          placeholder="Type here..."
        />
        <button onClick={handleSend} disabled={!joined}>Submit</button>
      </div>

      <div className='field field-inline'>

        <label> Name: </label>
        <input
          value={name}
          onChange={handleNameChange}
          placeholder="Your name"
        />
      </div>
      </div>

      <div className='die-machine'>

        <label className='reminder-text'> The first die inputted will be treated as the primary Die.</label>

        <div>
          <button onClick={handleAddDie} className='die-button' id='d4-button'>D4</button>
          <button onClick={handleAddDie} className='die-button' id='d6-button'>D6</button>
          <button onClick={handleAddDie} className='die-button' id='d8-button'>D8</button>
          <button onClick={handleAddDie} className='die-button' id='d10-button'>D10</button>
          <button onClick={handleAddDie} className='die-button' id='d12-button'>D12</button>
          <button onClick={handleAddDie} className='die-button' id='d20-button'>D20</button>
        </div>




        <div className='roll-row'>
        <div id='die-rolling-area'>
          {selectedDice.map((die, idx) => (
              <button
                key={`${die}-${idx}`}
                className="die-button"
                onClick={() => removeDieAt(idx)}
                title="Click to remove"
              >
                
                {die === 'd4s' ? 'non-crit d4' : die.toUpperCase()}
              </button>
            ))}
        </div>

        <button onClick={handleRoll} className='roll-button'> ROLL!</button>
        <button onClick={handleReRoll} className='roll-button'> Re-roll </button>
        <button onClick={handleInitiative} className='roll-button'> Initiative </button>
        <button onClick={clearDice} className='roll-button'> Clear </button>
        </div>
      </div>

      <div className='modifier-area'>
        <h3>Modifiers</h3>
        <div className='modifier-row'>
          <label className='field'>
           Roll with Wild die
            <input 
            type="checkbox"
            id="wild-die"
            checked={wildDie} 
            onChange={(e) => setWildDie(e.target.checked)} />
          
          </label>

          <label className='field'>
             Roll with added d4
            <input 
            type="checkbox" 
            id="extra-d4" 
            checked={extraD4} 
            onChange={(e) => setExtraD4(e.target.checked)} />
          </label>
        </div>



        <div className='modifier-row'>
          <label className='field'>
             Shaken
            <input 
              type="checkbox" 
              id="shaken" 
              checked={shake} 
              onChange={(e) => setShake(e.target.checked)} />
          </label>
        

        
          <div className='field'>
            <label htmlFor="wounded"> Wounds</label>
            <select 
            value={woundLevels} 
            onChange={(e) => setWoundLevels(e.target.value)}>
              {wounds.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className='field'>
          
            <label htmlFor="modifier-plus">Modifier Value</label>
            <input
              value={modifierValues}
              onChange={(handleModifier)}
              placeholder="Type here..." />
          </div>
        
        </div>
      </div>

      <div
        style={{
          border: '1px solid #25304a',
          borderRadius: '0.75rem',
          background: '#0f1730',
          padding: '1rem',
          minHeight: 420,
          
        }}
      >
        <h2 style={{ marginTop: 0 }}>Chat Log</h2>

        {updates.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No messages yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {updates.map((u, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #25304a',
                  background: '#0b1020',
                }}
              >
                {/*<div style={{ fontWeight: 700, whiteSpace: 'pre-wrap', display: 'block' }} dangerouslySetInnerHTML={{ __html: u.message }}></div>*/}
                <div style={{ fontWeight: 700, whiteSpace: 'pre-wrap', display: 'block' }}>{u.message}</div>
                <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6 }}>
                  session: {u.sessionId} • from: {u.from.slice(0, 6)} •{' '}
                  {new Date(u.timestamp).toLocaleTimeString()}
                </div>
              </div>

            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/" style={{ color: '#c9d4ff' }}>← Home</Link>
      </div>
    </div>
  );
};

export default SessionPage;