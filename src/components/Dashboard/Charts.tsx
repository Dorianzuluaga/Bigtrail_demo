import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

const Charts = () => {
  // Datos de ejemplo para los gráficos
  const airdropData = [
    { date: "2024-01", tokens: 850, campaigns: 12, users: 1200 },
    { date: "2024-02", tokens: 1200, campaigns: 18, users: 1800 },
    { date: "2024-03", tokens: 1100, campaigns: 15, users: 1600 },
    { date: "2024-04", tokens: 1800, campaigns: 25, users: 2400 },
    { date: "2024-05", tokens: 2200, campaigns: 32, users: 3100 },
    { date: "2024-06", tokens: 2847, campaigns: 28, users: 3500 },
  ];

  const campaignTypes = [
    { name: "Ubicación", value: 45, color: "#DC2626" },
    { name: "Interacción", value: 30, color: "#16A34A" },
    { name: "Social", value: 15, color: "#EA580C" },
    { name: "Tiempo", value: 10, color: "#9333EA" },
  ];

  const userEngagement = [
    { hour: "00:00", active: 120, total: 500 },
    { hour: "04:00", active: 80, total: 500 },
    { hour: "08:00", active: 300, total: 500 },
    { hour: "12:00", active: 450, total: 500 },
    { hour: "16:00", active: 380, total: 500 },
    { hour: "20:00", active: 420, total: 500 },
  ];

  const brandPerformance = [
    { brand: "Nike", campaigns: 15, tokens: 1200, engagement: 85 },
    { brand: "Adidas", campaigns: 12, tokens: 980, engagement: 78 },
    { brand: "BigTrail", campaigns: 20, tokens: 1500, engagement: 92 },
    { brand: "Puma", campaigns: 8, tokens: 650, engagement: 65 },
    { brand: "Decathlon", campaigns: 10, tokens: 800, engagement: 72 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="flex items-center space-x-2"
          >
            <PieChartIcon className="h-4 w-4" />
            <span>Campañas</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Marcas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Tokens Distribuidos</CardTitle>
                <CardDescription>
                  Evolución mensual de tokens BTM distribuidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={airdropData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Campañas Activas</CardTitle>
                <CardDescription>Número de campañas por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={airdropData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="campaigns"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Tipos de Campaña</CardTitle>
                <CardDescription>
                  Distribución por tipo de airdrop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={campaignTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {campaignTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Performance de Campañas</CardTitle>
                <CardDescription>Métricas clave por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignTypes.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{type.value}%</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(type.value * 10)} campañas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="card-adventure">
            <CardHeader>
              <CardTitle>Actividad de Usuarios</CardTitle>
              <CardDescription>
                Usuarios activos por hora del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                    name="Usuarios Activos"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Total Registrados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <Card className="card-adventure">
            <CardHeader>
              <CardTitle>Performance de Marcas</CardTitle>
              <CardDescription>
                Métricas de engagement por anunciante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandPerformance.map((brand, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{brand.brand}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          brand.engagement >= 90
                            ? "bg-success text-success-foreground"
                            : brand.engagement >= 75
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {brand.engagement}% engagement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Campañas:{" "}
                        </span>
                        <span className="font-medium">{brand.campaigns}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tokens: </span>
                        <span className="font-medium">{brand.tokens} BTM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Charts;
