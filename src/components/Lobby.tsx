import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { GameProgress } from '~/types/game.type';
import { createGame, resetGame, selectGame, startGame } from '~/store/gameSlice';

import ModeSelection from './ModeSelection';
import WaitingPlayer from './WaitingPlayer';
import ErrorBox from './ErrorBox';

function Lobby() {
  const game = useSelector(selectGame);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(resetGame());
  }, []);

  useEffect(() => {
    if (game.progress === GameProgress.PLAYING) {
      history.push('/game');
    }
  }, [game]);

  const selectMode = (selectedMode: string) => {
    dispatch(createGame(selectedMode));
  };

  const initGame = () => dispatch(startGame(game.id));

  return (
    <Layout>
      {game.error && <ErrorBox message={game.error} />}
      {game.mode ? (
        <WaitingPlayer
          gameId={game.id}
          mode={game.mode}
          playerList={game.playerList}
          initGame={initGame}
        />
      ) : (
        <ModeSelection handleClick={selectMode} />
      )}
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

export default Lobby;
