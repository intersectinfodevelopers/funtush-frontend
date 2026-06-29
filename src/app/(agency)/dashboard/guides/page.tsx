"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import guidesData from "../../../../../data/guides.json";

//check if a certification expires within 30 days
const isExpiringSoon = (expiry : string) => {
  const now = new Date();
  const exp = new Date(expiry);
  const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 30;
};

const statusMap: Record<string, {label: string; color: string}> = {
  available: {label: 'Available', color:'bg-green-100 text-green-800'},
  on_trek: {label: 'On Trek', color:'bg-yellow-100 text-yellow-800'},
  unavailable: {label: 'Unavailable', color:'bg-red-100 text-red-800'},
};

export default function GuidesPage(){
  //stats
  const stats = useMemo(()=>{
    const total = guidesData.length;
    const available = guidesData.filter((g)=> g.status === 'available').length;
    const onTrek = guidesData.filter((g)=> g.status === 'on_trek').length;
    const expiringSoon = guidesData.filter((g)=> 
      g.certifications.some((cert) => isExpiringSoon(cert.expiry))
  ).length;
  return {total, available, onTrek, expiringSoon};
  },[]);

  //filters
  const[search, setSearch] = useState('');
  const[statusFilter, setStatusFilter] = useState('all');
  const[languageFilter, setLanguageFilter] = useState('all');

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    guidesData.forEach((guide) => guide.languages.forEach((lang) => langs.add(lang)));
    return Array.from(langs);
  },[])

  const filteredGuides = useMemo(() => {
    return guidesData.filter((guide) => {
      const matchesSearch = guide.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
      const matchesLanguage = languageFilter === 'all' || guide.languages.includes(languageFilter);
      return matchesSearch && matchesStatus && matchesLanguage;
    })
  },[search, statusFilter, languageFilter]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Guides</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Guides" value={guidesData.length} color="text-black"/>
        <StatCard label="Available" value={stats.available} color="text-green-600" />
        <StatCard label="On Trek" value={stats.onTrek} color="text-yellow-600" />
        <StatCard label="Certs Expiring Soon" value={stats.expiringSoon} color="text-red-600" />
  
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_trek">On Trek</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="all">All Languages</option>
          {allLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGuides.map((guide) => {
          const statusInfo = statusMap[guide.status] || statusMap.unavailable;
          const hasExpiringCert = guide.certifications.some((c) => isExpiringSoon(c.expiry));
          const nextExpiry = guide.certifications
            .map((c) => new Date(c.expiry))
            .filter((d) => d > new Date())
            .sort((a, b) => a.getTime() - b.getTime())[0];

          return (
            <a
              key={guide.id}
              href={`/dashboard/guides/${guide.id}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 shrink-0 overflow-hidden">
                    {guide.photo && (
                      <Image src={guide.photo} alt={guide.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{guide.name}</CardTitle>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Languages:</span> {guide.languages.join(', ')}
                  </p>
                  {hasExpiringCert && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Cert expires: {nextExpiry?.toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-neutral-500">
                  ★ {guide.rating}
                </CardFooter>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}

//Stat Card
function StatCard({ label, value, color = '' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center shadow-sm">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-neutral-600">{label}</div>
    </div>
  );
}