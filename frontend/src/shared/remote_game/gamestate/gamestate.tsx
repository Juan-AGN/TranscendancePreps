import { useRef, useEffect } from "react";
import { useNotification } from '../notifications';
import { useLobby } from '../lobby';
import { useWs } from "../wshandler";
import { leavelobby } from "../game_endpoints/lobbies";


export function Gamehandler() {
    const canvasRef = useRef(null);
    const { game, addGame } = useWs();
	 const { handleApiError } = useNotification();
    const { names, lobby, addLobby } = useLobby();

	function leavelob() {
		if (lobby)
		{
			leavelobby(lobby!.id, handleApiError, addLobby);
			addGame(null);
		}
		else
		{
			addLobby(null);
			addGame(null);
		}
    }

    function paintgame(dimensions : number) {
        if (!game) return;
	    const c = canvasRef.current;
 		if (!c) return;
    	const ctx = c.getContext("2d");
    	if (!ctx) return;

        const startx = (dimensions - game.borderx) / 2;
    
        const starty = (dimensions - game.bordery) / 2;

        ctx.clearRect(0, 0, game.borderx, game.bordery);
		ctx.fillStyle= "grey";
		ctx.strockeStyle = "grey";

        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.rect(0, 0, game.borderx + (startx * 2), game.bordery + (starty * 2));
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(startx, starty, game.borderx, game.bordery);
        ctx.fill();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		for (let player of game.alive)
		{
			ctx.beginPath();
			ctx.strokeStyle = "blue";
			ctx.fillStyle = "purple";
			ctx.arc(player.x + startx, player.y + starty, player.hitbox / 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			if (player.player === names.getmenoupdt())
			{
				ctx.beginPath();
				ctx.strokeStyle = "blue";
				ctx.fillStyle = "blue";
				ctx.arc(player.x + startx, player.y + starty, player.hitbox / 2, 0, 2 * Math.PI);
				ctx.arc(player.x + startx, player.y + starty, player.hitbox / 3, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(player.x + startx, player.y + starty, player.hitbox / 3, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		}
		for (let ball of game.ball)
		{
			ctx.beginPath();
			ctx.fillStyle = "red";
			ctx.strokeStyle = "grey";
			ctx.arc(ball.x + startx, ball.y + starty, ball.hitbox / 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
		ctx.fillStyle= "white";
		ctx.strockeStyle = "grey";
		for (let player of game.alive)
		{
			ctx.font = `${30}px Arial`;
			
			if (player.y > game.bordery / 2)
			{
				ctx.strokeText(names.checkname(player.player)!.substring(0, 8), player.x + startx, player.y + starty - (player.hitbox / 2) - 20);
				ctx.fillText(names.checkname(player.player)!.substring(0, 8), player.x + startx, player.y + starty - (player.hitbox / 2) - 20);
			}
			else
			{
				ctx.strokeText(names.checkname(player.player)!.substring(0, 8), player.x + startx, player.y + starty + (player.hitbox / 2) + 20);
				ctx.fillText(names.checkname(player.player)!.substring(0, 8), player.x + startx, player.y + starty + (player.hitbox / 2) + 20);
			}
		}
		ctx.fillStyle= "black";
		ctx.strockeStyle = "black";
    }

    useEffect(() => {
        if (game!.borderx > 1500 || game!.bordery > 1500)
            paintgame(2000);
        else if (game!.borderx > 1000 || game!.bordery > 1000)
            paintgame(1500);
        else
            paintgame(1000);
    }, [game]);

    if (game!.borderx > 1500 || game!.bordery > 1500)
        return (<div className="fixed inset-0 bg-red-400 flex items-center justify-center pointer-events-none flex-col">
			<div className="h-5 w-20 bg-radial from-red-100/20 to-red-300/20 rounded-t-2xl cursor-pointer text-center content-center shadow hover:from-red-100 hover:to-red-200 transition delay-150 duration-300 ease-in-out pointer-events-auto ext-sm" onClick={leavelob}>LEAVE</div>
			<canvas ref={canvasRef} width={2000} height={2000} className=" aspect-square w-[85vw] h-[85vw] landscape:w-[85vh] landscape:h-[85vh] shadow-2xl inset-shadow-purple-50 border-4 border-double rounded-xl"></canvas></div>);
    else if (game!.borderx > 1000 || game!.bordery > 1000)
        return (<div className="fixed inset-0 flex items-center justify-center pointer-events-none flex-col">
			<div className="h-5 w-20 bg-radial from-red-100/20 to-red-300/20 rounded-t-2xl cursor-pointer text-center content-center shadow hover:from-red-100 hover:to-red-200 transition delay-150 duration-300 ease-in-out pointer-events-auto ext-sm" onClick={leavelob}>LEAVE</div>
			<canvas ref={canvasRef} width={1500} height={1500} className=" aspect-square w-[85vw] h-[85vw] landscape:w-[85vh] landscape:h-[85vh] shadow-2xl inset-shadow-purple-50 border-4 border-double rounded-xl"></canvas></div>);
    else
        return (<div className="fixed inset-0 flex items-center justify-center pointer-events-none flex-col">
			<div className="h-5 w-20 bg-radial from-red-100/20 to-red-300/20 rounded-t-2xl cursor-pointer text-center content-center shadow hover:from-red-100 hover:to-red-200 transition delay-150 duration-300 ease-in-out pointer-events-auto text-sm" onClick={leavelob}>LEAVE</div>
			<canvas ref={canvasRef} width={1000} height={1000} className=" aspect-square w-[85vw] h-[85vw] landscape:w-[85vh] landscape:h-[85vh] shadow-2xl inset-shadow-purple-50 border-4 border-double rounded-xl"></canvas></div>);
}
