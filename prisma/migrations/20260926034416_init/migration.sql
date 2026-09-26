-- CreateEnum
CREATE TYPE "TipoTropa" AS ENUM ('ATAQUE', 'DEFENSA', 'ESPIONAJE', 'TRANSPORTE', 'OCUPAR');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('LEADER', 'CO_LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('INVITATION', 'REQUEST');

-- CreateEnum
CREATE TYPE "MessageCategory" AS ENUM ('JUGADOR', 'FAMILIA', 'SISTEMA', 'BATALLA', 'CONSTRUCCION');

-- CreateTable
CREATE TABLE "ConfiguracionHabitacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "produccionBase" DOUBLE PRECISION NOT NULL,
    "produccionRecurso" TEXT,
    "puntos" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionHabitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRequirement" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "requiredRoomId" TEXT NOT NULL,
    "requiredLevel" INTEGER NOT NULL,

    CONSTRAINT "RoomRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionEntrenamiento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionEntrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRequirement" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "requiredTrainingId" TEXT NOT NULL,
    "requiredLevel" INTEGER NOT NULL,

    CONSTRAINT "TrainingRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionTropa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,
    "ataque" INTEGER NOT NULL,
    "defensa" INTEGER NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "velocidad" INTEGER NOT NULL,
    "salario" INTEGER NOT NULL,
    "tipo" "TipoTropa" NOT NULL,
    "requisitos" TEXT[],
    "bonusAtaque" TEXT[],
    "bonusDefensa" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionTropa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoderAtaque" (
    "id" TEXT NOT NULL,
    "propiedades" INTEGER NOT NULL,
    "honor" INTEGER NOT NULL,
    "modificador" INTEGER NOT NULL,

    CONSTRAINT "PoderAtaque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TropaBonusContrincante" (
    "id" TEXT NOT NULL,
    "tropaAtacanteId" TEXT NOT NULL,
    "tropaDefensoraId" TEXT NOT NULL,
    "factorPrioridad" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TropaBonusContrincante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propiedad" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" INTEGER NOT NULL,
    "barrio" INTEGER NOT NULL,
    "edificio" INTEGER NOT NULL,
    "armas" DOUBLE PRECISION NOT NULL,
    "municion" DOUBLE PRECISION NOT NULL,
    "alcohol" DOUBLE PRECISION NOT NULL,
    "dolares" DOUBLE PRECISION NOT NULL,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitacionUsuario" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "configuracionHabitacionId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,

    CONSTRAINT "HabitacionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TropaUsuario" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "configuracionTropaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "TropaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TropaSeguridadUsuario" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "configuracionTropaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "TropaSeguridadUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrenamientoUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configuracionEntrenamientoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,

    CONSTRAINT "EntrenamientoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntuacionUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puntosHabitaciones" DOUBLE PRECISION NOT NULL,
    "puntosTropas" DOUBLE PRECISION NOT NULL,
    "puntosEntrenamientos" DOUBLE PRECISION NOT NULL,
    "puntosTotales" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuntuacionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaConstruccion" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "habitacionId" TEXT NOT NULL,
    "nivelDestino" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFinalizacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColaConstruccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaReclutamiento" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "tropaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinalizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColaReclutamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaMisiones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propiedadOrigenId" TEXT NOT NULL,
    "tipoMision" TEXT NOT NULL,
    "tropas" TEXT NOT NULL,
    "origenCiudad" INTEGER NOT NULL,
    "origenBarrio" INTEGER NOT NULL,
    "origenEdificio" INTEGER NOT NULL,
    "destinoCiudad" INTEGER NOT NULL,
    "destinoBarrio" INTEGER NOT NULL,
    "destinoEdificio" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaLlegada" TIMESTAMP(3) NOT NULL,
    "fechaRegreso" TIMESTAMP(3),
    "velocidadFlota" DOUBLE PRECISION NOT NULL,
    "duracionViaje" INTEGER NOT NULL,

    CONSTRAINT "ColaMisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaEntrenamiento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "entrenamientoId" TEXT NOT NULL,
    "nivelDestino" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinalizacion" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColaEntrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "type" "InvitationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "category" "MessageCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "SuperUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomRequirement_roomId_requiredRoomId_key" ON "RoomRequirement"("roomId", "requiredRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRequirement_trainingId_requiredTrainingId_key" ON "TrainingRequirement"("trainingId", "requiredTrainingId");

-- CreateIndex
CREATE UNIQUE INDEX "PoderAtaque_propiedades_honor_key" ON "PoderAtaque"("propiedades", "honor");

-- CreateIndex
CREATE UNIQUE INDEX "TropaBonusContrincante_tropaAtacanteId_tropaDefensoraId_key" ON "TropaBonusContrincante"("tropaAtacanteId", "tropaDefensoraId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Propiedad_ciudad_barrio_edificio_key" ON "Propiedad"("ciudad", "barrio", "edificio");

-- CreateIndex
CREATE UNIQUE INDEX "HabitacionUsuario_propiedadId_configuracionHabitacionId_key" ON "HabitacionUsuario"("propiedadId", "configuracionHabitacionId");

-- CreateIndex
CREATE UNIQUE INDEX "TropaUsuario_propiedadId_configuracionTropaId_key" ON "TropaUsuario"("propiedadId", "configuracionTropaId");

-- CreateIndex
CREATE UNIQUE INDEX "TropaSeguridadUsuario_propiedadId_configuracionTropaId_key" ON "TropaSeguridadUsuario"("propiedadId", "configuracionTropaId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrenamientoUsuario_userId_configuracionEntrenamientoId_key" ON "EntrenamientoUsuario"("userId", "configuracionEntrenamientoId");

-- CreateIndex
CREATE UNIQUE INDEX "PuntuacionUsuario_userId_key" ON "PuntuacionUsuario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ColaReclutamiento_propiedadId_key" ON "ColaReclutamiento"("propiedadId");

-- CreateIndex
CREATE UNIQUE INDEX "ColaEntrenamiento_propiedadId_key" ON "ColaEntrenamiento"("propiedadId");

-- CreateIndex
CREATE UNIQUE INDEX "Family_name_key" ON "Family"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Family_tag_key" ON "Family"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_userId_key" ON "FamilyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_familyId_userId_key" ON "FamilyInvitation"("familyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperUser_username_key" ON "SuperUser"("username");

-- AddForeignKey
ALTER TABLE "RoomRequirement" ADD CONSTRAINT "RoomRequirement_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRequirement" ADD CONSTRAINT "RoomRequirement_requiredRoomId_fkey" FOREIGN KEY ("requiredRoomId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequirement" ADD CONSTRAINT "TrainingRequirement_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequirement" ADD CONSTRAINT "TrainingRequirement_requiredTrainingId_fkey" FOREIGN KEY ("requiredTrainingId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaBonusContrincante" ADD CONSTRAINT "TropaBonusContrincante_tropaAtacanteId_fkey" FOREIGN KEY ("tropaAtacanteId") REFERENCES "ConfiguracionTropa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaBonusContrincante" ADD CONSTRAINT "TropaBonusContrincante_tropaDefensoraId_fkey" FOREIGN KEY ("tropaDefensoraId") REFERENCES "ConfiguracionTropa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_configuracionHabitacionId_fkey" FOREIGN KEY ("configuracionHabitacionId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_configuracionTropaId_fkey" FOREIGN KEY ("configuracionTropaId") REFERENCES "ConfiguracionTropa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaSeguridadUsuario" ADD CONSTRAINT "TropaSeguridadUsuario_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaSeguridadUsuario" ADD CONSTRAINT "TropaSeguridadUsuario_configuracionTropaId_fkey" FOREIGN KEY ("configuracionTropaId") REFERENCES "ConfiguracionTropa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_configuracionEntrenamientoId_fkey" FOREIGN KEY ("configuracionEntrenamientoId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntuacionUsuario" ADD CONSTRAINT "PuntuacionUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaConstruccion" ADD CONSTRAINT "ColaConstruccion_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaConstruccion" ADD CONSTRAINT "ColaConstruccion_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaReclutamiento" ADD CONSTRAINT "ColaReclutamiento_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaReclutamiento" ADD CONSTRAINT "ColaReclutamiento_tropaId_fkey" FOREIGN KEY ("tropaId") REFERENCES "ConfiguracionTropa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaMisiones" ADD CONSTRAINT "ColaMisiones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaMisiones" ADD CONSTRAINT "ColaMisiones_propiedadOrigenId_fkey" FOREIGN KEY ("propiedadOrigenId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaEntrenamiento" ADD CONSTRAINT "ColaEntrenamiento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaEntrenamiento" ADD CONSTRAINT "ColaEntrenamiento_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaEntrenamiento" ADD CONSTRAINT "ColaEntrenamiento_entrenamientoId_fkey" FOREIGN KEY ("entrenamientoId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
