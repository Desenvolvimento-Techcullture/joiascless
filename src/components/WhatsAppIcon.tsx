import React from 'react';
import type { SVGProps } from 'react';

export default function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><circle cx={9} cy={9} r={1}></circle><circle cx={15} cy={15} r={1}></circle><path d="M8 9a7 7 0 0 0 7 7m-9 5.2A11 11 0 1 0 2.8 18L2 22Z"></path></g></svg>);
}