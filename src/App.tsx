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
    position?: string;
    goals?: number;
    assists?: number;
  };

  type Game = {
    goals: number;
    assists: number;
    plusMinus: number;
  };

  type PlayerResponse = {
    last5Games: Game[];
  };

  const [data, setData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const players = [
      { id: "8477404", name: "Jake Guentzel", pos: "F" },
      { id: "8478550", name: "Artemi Panarin", pos: "F" },
      { id: "8480027", name: "Jason Robertson", pos: "F" },
      { id: "8478427", name: "Sebastian Aho", pos: "F" },
      { id: "8471675", name: "Sidney Crosby", pos: "F" },
      { id: "8478449", name: "Roope Hintz", pos: "F" },
      { id: "8482720", name: "Matthew Knies", pos: "F" },
      { id: "8477949", name: "Alex Tuch", pos: "F" },
      { id: "8476459", name: "Mika Zibanejad" },
      { id: "8477476", name: "Artturi Lehkonen", pos: "F" },
      { id: "8484227", name: "Will Smith" },
      { id: "8475168", name: "Matt Duchene", pos: "F" },
      { id: "8476455", name: "Gabriel Landeskog", pos: "F" },

      { id: "8480069", name: "Cale Makar", pos: "D" },
      { id: "8478038", name: "Devon Toews", pos: "D" },
      { id: "8479323", name: "Adam Fox", pos: "D" },
      { id: "8478407", name: "Vince Dunn", pos: "D" },
      { id: "8476906", name: "Shayne Gostisbehere", pos: "D" },
      { id: "8475218", name: "Mattias Ekholm", pos: "D" },
      { id: "8477950", name: "Tony DeAngelo", pos: "D" },
    ];

    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          players.map((p) =>
            fetch(`https://api-web.nhle.com/v1/player/${p.id}/landing`)
          )
        );

        const json: PlayerResponse[] = await Promise.all(
          responses.map((r) => r.json())
        );

        const getGoals = (games: Game[]) =>
          games.reduce((sum, g) => sum + (g.goals || 0), 0);
        const getAssists = (games: Game[]) =>
          games.reduce((sum, g) => sum + (g.assists || 0), 0);
        const getPlusMinus = (games: Game[]) =>
          games.reduce((sum, g) => sum + (g.plusMinus || 0), 0);

        const combined = players.map((p, i) => {
          const last5 = json[i].last5Games ?? [];
          return {
            name: p.name,
            position: p.pos,
            goals: getGoals(last5),
            assists: getAssists(last5),
            plusMinus: getPlusMinus(last5),
            fantasyPoints:
              p.pos === "F"
                ? getGoals(last5) * 2 +
                  getAssists(last5) +
                  getPlusMinus(last5) * 0.5
                : getGoals(last5) * 3 +
                  getAssists(last5) +
                  getPlusMinus(last5) * 0.5,
          };
        });
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

  const dataForward = data.filter((p) => p.position === "F");
  const dataDefense = data.filter((p) => p.position === "D");

  const tableF = useReactTable<Player>({
    data: dataForward,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "fantasyPoints", desc: true }],
    },
  });
  const tableD = useReactTable<Player>({
    data: dataDefense,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "fantasyPoints", desc: true }],
    },
  });

  if (loading) return <div>Loading data...</div>;

  return (
    <div className="flex gap-[2rem] justify-between">
      <table>
        <thead>
          {tableF.getHeaderGroups().map((hg) => (
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
          {tableF.getRowModel().rows.map((row) => (
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
          {tableF.getFooterGroups().map((fg) => (
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
      <table>
        <thead>
          {tableD.getHeaderGroups().map((hg) => (
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
          {tableD.getRowModel().rows.map((row) => (
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
          {tableD.getFooterGroups().map((fg) => (
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
