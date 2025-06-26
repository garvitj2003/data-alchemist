"use client";

import { useAtomValue } from "jotai";
import { uploadedFilesAtom, EntityType } from "@/store/uploadAtoms";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

type Props = {
  entity: EntityType;
};

export function EntityTable({ entity }: Props) {
  const uploadedFiles = useAtomValue(uploadedFilesAtom);
  const data = uploadedFiles.find((f) => f.entityType === entity)?.rawData || [];

  if (data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No data found for {entity}.</p>
      </Card>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <Card className="border rounded-xl">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold capitalize mb-4">{entity} Table</h2>
        <ScrollArea className="max-h-[500px] w-full overflow-auto border rounded-md">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border px-4 py-2 text-left font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-muted/40">
                  {columns.map((col) => (
                    <td key={col} className="border px-4 py-1">
                      <Input
                        type="text"
                        defaultValue={row[col]}
                        className="h-8"
                        onChange={(e) => {
                          // Optional: update Jotai atom here if inline edit needs persistence
                          // You can also debounce or sync changes later
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
