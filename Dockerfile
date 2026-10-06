# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend
WORKDIR /src
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src
COPY server/Sera.Api.csproj server/
ARG NUGET_SOURCE=https://mirror2.chabokan.net/nuget/v3/index.json
RUN dotnet restore server/Sera.Api.csproj --source "$NUGET_SOURCE"
COPY server/ server/
RUN dotnet publish server/Sera.Api.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
COPY --from=backend /out .
COPY --from=frontend /src/dist ./wwwroot
COPY server/schema.sql server/seed.json ./
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1/health >/dev/null || exit 1
ENTRYPOINT ["dotnet", "Sera.Api.dll"]
