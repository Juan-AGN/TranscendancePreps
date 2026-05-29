type Props = {
  ComponentBig: React.ComponentType;
  ComponentSmall: any;
};

export function Doubledivvert({ ComponentBig, ComponentSmall }: Props)
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div>
		<div className="w-[90vw] h-[50vw] landscape:w-[90vw] landscape:h-[50vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-10 pointer-events-auto rounded-2xl m-4 shadow">
			<ComponentBig/>
		</div> 
		<div className="w-[90vw] h-[10vw] landscape:w-[90vw] landscape:h-[10vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-10 pointer-events-auto rounded-2xl m-4 shadow">
            <ComponentSmall/>
		</div>
		</div>
	</div>);
}

export function Singledivgame({ Component }: { Component: React.ComponentType })
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div className="w-[90vw] h-[60vw] landscape:w-[90vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-10 pointer-events-auto rounded-2xl m-4 shadow">
			<Component/>
		</div> 
	</div>);
}

export function Doubledivgame({ ComponentBig, ComponentSmall }: Props)
{
    return (
	<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
		<div className="w-[75vw] h-[60vw] landscape:w-[75vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-10 pointer-events-auto rounded-2xl m-4 shadow">
			<ComponentBig/>
		</div> 
		<div className="w-[15vw] h-fit landscape:w-[15vw] py-2 aspect-auto bg-mauve-400/10 backdrop-blur-xs z-10 pointer-events-auto rounded-xl m-4 shadow">
            <ComponentSmall/>
		</div>
	</div>);
}

interface TextFieldProps {
	value: string;
	onChange: (value: string) => void;
	submit: (value: string) => void;
	text: string;
	tw: number;
}

export function TextField({ value, onChange, text, submit, tw }: TextFieldProps) {
	function dothing() {
		submit(value);
	}

	return (
		<div className="h-10 text-center content-center flex rounded-2xl overflow-hidden border-solid border" style={{ width: `${tw}%` }}>
			<input className={"h-10 text-center content-center bg-amber-100 focus:outline-none focus:inset-shadow-sm focus:inset-shadow-amber-300 ease-in-out w-[80%]"} value={value} onChange={(e) => onChange(e.target.value)}/>
			<div onClick={dothing} className={"h-10 text-center content-center bg-radial from-cyan-100 to-blue-300 hover:from-cyan-100 hover:to-cyan-200 border-l-2 border-double w-[20%]"}>{text}</div>
		</div>
	);
};
