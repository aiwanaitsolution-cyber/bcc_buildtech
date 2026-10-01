import type {Metadata} from "next";
import {CorporatePage} from "@/components/bcc-site";
import {pageMeta} from "@/app/data";
export function generateStaticParams(){return Object.keys(pageMeta).map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const p=pageMeta[slug]||pageMeta.about;return{title:`${p.eyebrow} | BCC Buildtech Limited`,description:p.copy};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <CorporatePage slug={slug}/>}
