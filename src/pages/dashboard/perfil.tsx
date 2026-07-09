import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Calendar, Heart, Star, Crown } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

interface ProfileData {
  displayName: string;
  birthDate: string;
  gender: string;
  orientation: string;
  nickname: string;
  title: string;
  rank: string;
  points: number;
  avatarUrl: string | null;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "Fiel Anónimo",
    birthDate: "",
    gender: "",
    orientation: "",
    nickname: "",
    title: "Iniciado",
    rank: "Fiel",
    points: 150,
    avatarUrl: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);

  const saveProfile = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  return (
    <AppLayout title="Mi Perfil" icon={<User className="w-5 h-5" />}>
      <BookPage pageKey="perfil">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mi Perfil</h1>
            <p className="font-body text-muted-foreground">
              Tus datos personales dentro del culto
            </p>
          </div>

          {/* Avatar y nombre */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-24 h-24 rounded-full border-2 border-gold/30 bg-card/50 flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground/50" />
              )}
              <button className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-gold" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl text-foreground">{profile.displayName}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-heading text-xs text-gold px-2 py-0.5 border border-gold/30 rounded-sm">
                  {profile.rank}
                </span>
                <span className="font-heading text-xs text-wine px-2 py-0.5 border border-wine/30 rounded-sm">
                  {profile.title}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-gold">
                <Star className="w-3 h-3" />
                <span className="font-display text-lg">{profile.points}</span>
                <span className="font-heading text-xs text-muted-foreground">pts de fe</span>
              </div>
            </div>
          </div>

          {/* Datos del perfil */}
          {!isEditing ? (
            <div className="space-y-3">
              <ParchmentCard title="Datos Personales" icon={<User className="w-4 h-4" />}>
                <div className="space-y-3 font-body text-sm">
                  <ProfileField label="Apodo" value={profile.nickname || "No especificado"} />
                  <ProfileField label="Fecha de nacimiento" value={profile.birthDate || "No especificado"} />
                  <ProfileField label="Sexo" value={profile.gender || "No especificado"} />
                  <ProfileField label="Orientación" value={profile.orientation || "No especificado"} />
                </div>
                <RitualButton
                  variant="outline"
                  onClick={() => {
                    setEditData(profile);
                    setIsEditing(true);
                  }}
                  className="w-full mt-4"
                >
                  Editar Perfil
                </RitualButton>
              </ParchmentCard>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <ParchmentCard title="Editar Perfil" icon={<User className="w-4 h-4" />}>
                <div className="space-y-3">
                  <EditField
                    label="Apodo"
                    value={editData.nickname}
                    onChange={(v) => setEditData({ ...editData, nickname: v })}
                  />
                  <EditField
                    label="Fecha de nacimiento"
                    value={editData.birthDate}
                    type="date"
                    onChange={(v) => setEditData({ ...editData, birthDate: v })}
                  />
                  <EditField
                    label="Sexo"
                    value={editData.gender}
                    onChange={(v) => setEditData({ ...editData, gender: v })}
                  />
                  <EditField
                    label="Orientación"
                    value={editData.orientation}
                    onChange={(v) => setEditData({ ...editData, orientation: v })}
                  />
                  <div className="flex gap-2 pt-2">
                    <RitualButton variant="gold" onClick={saveProfile} className="flex-1">
                      Guardar
                    </RitualButton>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </ParchmentCard>
            </motion.div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/20">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function EditField({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="font-heading text-xs text-muted-foreground tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                   text-foreground font-body text-sm focus:outline-none focus:border-gold/50"
      />
    </div>
  );
}