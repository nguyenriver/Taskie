FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["TaskieWNC.csproj", "./"]
RUN dotnet restore "TaskieWNC.csproj"
COPY . .
RUN dotnet build "TaskieWNC.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskieWNC.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5199
EXPOSE 5199
ENTRYPOINT ["dotnet", "TaskieWNC.dll"]
