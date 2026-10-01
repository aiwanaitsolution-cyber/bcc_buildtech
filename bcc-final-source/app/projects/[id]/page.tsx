import {ProjectDetail} from "@/components/bcc-site";
import {projects} from "@/app/data";
export function generateStaticParams(){return projects.map(p=>({id:p.id}));}
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <ProjectDetail id={id}/>}
