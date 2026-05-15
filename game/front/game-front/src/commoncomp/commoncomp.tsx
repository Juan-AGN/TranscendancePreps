import { useEffect, useRef, useState } from "react";

type Props = {
  ComponentBig: React.ComponentType;
  ComponentSmall: React.ComponentType;
};

export function Doubledivvert({ ComponentBig, ComponentSmall }: Props)
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div>
		<div className="w-[90vw] h-[50vw] landscape:w-[90vw] landscape:h-[50vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
			<ComponentBig/>
		</div> 
		<div className="w-[90vw] h-[10vw] landscape:w-[90vw] landscape:h-[10vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
            <ComponentSmall/>
		</div>
		</div>
	</div>);
}

export function Singledivgame({ Component }: { Component: React.ComponentType })
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div className="w-[90vw] h-[60vw] landscape:w-[90vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
			<Component/>
		</div> 
	</div>);
}

export function Doubledivgame({ ComponentBig, ComponentSmall }: Props)
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div className="w-[75vw] h-[60vw] landscape:w-[75vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
			<ComponentBig/>
		</div> 
		<div className="w-[15vw] h-[60vw] landscape:w-[15vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
            <ComponentSmall/>
		</div>
	</div>);
}