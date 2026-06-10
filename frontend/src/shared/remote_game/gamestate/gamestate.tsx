import { useRef, useEffect } from "react";
import { useNotification } from '../notifications';
import { useLobby } from '../lobby';
import { useWs } from "../wshandler";
import { leavelobby } from "../game_endpoints/lobbies";


export function Gamehandler() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
	const bgImageRef2 = useRef<HTMLImageElement | null>(null);
    const { game, addGame } = useWs();
	 const { handleApiError } = useNotification();
    const { names, lobby, addLobby } = useLobby();

    useEffect(() => {
        const img = new Image();
        img.src = "/images/groundfloor.png";
        img.onload = () => { bgImageRef.current = img; };
        const img2 = new Image();
        img2.src = "/images/groundfloorgame.png";
        img2.onload = () => { bgImageRef2.current = img2; };
    }, []);

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
        if (!game)
			return;
	    const c = canvasRef.current;
		let pattern = null;
		let pattern2 = null;
 		if (!c)
			return;
    	const ctx = c.getContext("2d");
    	if (!ctx)
			return;

        const startx = (dimensions - game.borderx) / 2;
    
        const starty = (dimensions - game.bordery) / 2;

        ctx.clearRect(0, 0, game.borderx, game.bordery);
		ctx.fillStyle= "grey";
		ctx.strokeStyle = "grey";

		if (bgImageRef.current)
			pattern = ctx.createPattern(bgImageRef.current, 'repeat');

		if (bgImageRef2.current)
			pattern2 = ctx.createPattern(bgImageRef2.current, 'repeat');

        if (pattern) {
			ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, game.borderx + (startx * 2), game.bordery + (starty * 2));
        } else {
            ctx.fillStyle = "#1a1a2e";
            ctx.beginPath();
            ctx.rect(0, 0, game.borderx + (startx * 2), game.bordery + (starty * 2));
            ctx.fill();
        }

		ctx.fillStyle = "black";
        ctx.beginPath();

	    if (pattern2) {
			ctx.fillStyle = pattern2;
            ctx.fillRect(startx, starty, game.borderx, game.bordery);
        } else {
			ctx.rect(startx, starty, game.borderx, game.bordery);
			ctx.fill();
        }


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
		ctx.strokeStyle = "grey";
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
		ctx.strokeStyle = "black";
    }

    useEffect(() => {
        if (game!.borderx > 1500 || game!.bordery > 1500)
            paintgame(2000);
        else if (game!.borderx > 1000 || game!.bordery > 1000)
            paintgame(1500);
        else
            paintgame(1000);
    }, [game]);

    const canvasRes = (game!.borderx > 1500 || game!.bordery > 1500) ? 2000
        : (game!.borderx > 1000 || game!.bordery > 1000) ? 1500
        : 1000;

    return (
        <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-yellow-300/50 bg-white/35 backdrop-blur-2xl shadow-[0_30px_90px_rgba(55,78,140,0.25)] p-5">
                <canvas
                    ref={canvasRef}
                    width={canvasRes}
                    height={canvasRes}
                    className="aspect-square w-[80vmin] rounded-[1.5rem] border border-yellow-400/40 shadow-[0_8px_30px_rgba(55,78,140,0.20)]"
                />
                <button
                    onClick={leavelob}
                    className="rounded-full border border-red-300/50 bg-red-50/70 px-10 py-3 text-sm font-bold tracking-[0.18em] text-red-700 transition hover:bg-red-100/80"
                >
                    LEAVE GAME
                </button>
            </div>
        </div>
    );
}
