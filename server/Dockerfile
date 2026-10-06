FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY server/Sera.Api.csproj server/
ARG NUGET_SOURCE=https://mirror2.chabokan.net/nuget/v3/index.json
RUN dotnet restore server/Sera.Api.csproj --source "$NUGET_SOURCE"
COPY server/ server/
RUN dotnet publish server/Sera.Api.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
COPY --from=build /out .
COPY server/schema.sql server/seed.json ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Sera.Api.dll"]
