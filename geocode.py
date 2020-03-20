# pip3 install requests

api_key = "AIzaSyDFFK" + "YORm_odJsJBZ0dj" + "9h2qd29gGL0aUU"

from sys import argv
import csv
import requests

file_name = argv[1]
address_cols = argv[2].split(",")
output_name = argv[3]
print(file_name + " -> add geo and save as -> " + output_name)

with open(file_name, "r") as file:
    with open(output_name, "w") as op:
        rdr = csv.reader(file)
        wrt = csv.writer(op)
        headers = None
        index = 0
        for line in rdr:
            if headers is None:
                headers = line
                headers.append('latitude')
                headers.append('longitude')
                wrt.writerow(headers)
            else:
                address = []
                met_string = False
                for col in address_cols:
                    try:
                        if met_string:
                            address.append(col)
                        else:
                            mycol = int(col)
                            address.append(line[mycol])
                    except:
                        address.append(col)
                        met_string = True
                response = requests.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + ', '.join(address) + "&key=" + api_key).json()
                results = response['results']
                if (len(results) > 0):
                    info = results[0]['geometry']['location']
                    line.append(info['lat'])
                    line.append(info['lng'])
                    wrt.writerow(line)
                else:
                    print('no results for ' + ', '.join(address))
                    print(response)
                    quit()
            index += 1
            if index % 15 == 0:
                print(str(index))
