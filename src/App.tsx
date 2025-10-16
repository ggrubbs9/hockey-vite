/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import "./App.css";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

function App() {
  type Player = {
    name: string;
    goals?: number;
    assists?: number;
  };

  const [data, setData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const players = [
      { id: "8477404", name: "Jake Guentzel" },
      { id: "8478550", name: "Artemi Panarin" },
      { id: "8480027", name: "Jason Robertson" },
      { id: "8478427", name: "Sebastian Aho" },
      { id: "8471675", name: "Sidney Crosby" },
      { id: "8478449", name: "Roope Hintz" },
      { id: "8482720", name: "Matthew Knies" },
      { id: "8477949", name: "Alex Tuch" },
      { id: "8476459", name: "Mika Zibanejad" },
      { id: "8477476", name: "Artturi Lehkonen" },
      { id: "8484227", name: "Will Smith" },
      { id: "8475168", name: "Matt Duchene" },
      { id: "8476455", name: "Gabriel Landeskog" },
    ];

    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          players.map((p) =>
            fetch(`https://api-web.nhle.com/v1/player/${p.id}/landing`)
          )
        );

        const json = await Promise.all(responses.map((r) => r.json()));

        const getGoals = (games: any[] = []) =>
          games.reduce((sum, g) => sum + (g.goals || 0), 0);
        const getAssists = (games: any[] = []) =>
          games.reduce((sum, g) => sum + (g.assists || 0), 0);
        const getPlusMinus = (games: any[] = []) =>
          games.reduce((sum, g) => sum + (g.plusMinus || 0), 0);

        const combined = players.map((p, i) => {
          const last5 = json[i]?.last5Games ?? [];
          return {
            name: p.name,
            goals: getGoals(last5),
            assists: getAssists(last5),
            plusMinus: getPlusMinus(last5),
            fantasyPoints:
              getGoals(last5) * 2 +
              getAssists(last5) +
              getPlusMinus(last5) * 0.5,
          };
        });

        console.log(json);
        setData(combined);
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = useMemo<ColumnDef<Player, any>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "goals", header: "Goals" },
      { accessorKey: "assists", header: "Assists" },
      { accessorKey: "plusMinus", header: "+/-" },
      { accessorKey: "fantasyPoints", header: "FP" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "fantasyPoints", desc: true }],
    },
  });

  if (loading) return <div>Loading data...</div>;

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((fg) => (
            <tr key={fg.id}>
              {fg.headers.map((h) => (
                <th key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.footer, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}

export default App;
